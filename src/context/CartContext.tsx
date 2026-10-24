"use client";

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import type { Product } from "@/types";
import { GUEST_KEY, readCartSnapshot, rememberGuestToken, writeCartSnapshot } from "@/lib/cartToken";
import { store } from "@/store/store";
import { cartApi } from "@/store/cartApi";
import { lineStock } from "@/lib/variants";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD"; product: Product; quantity?: number; size?: string; color?: string }
  | { type: "REMOVE"; productId: string; size?: string; color?: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number; size?: string; color?: string }
  | { type: "SET"; items: CartItem[] }
  | { type: "MERGE_ITEMS"; items: CartItem[] }
  | { type: "CLEAR" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "TOGGLE_CART" };

function sameLine(item: CartItem, productId: string, size?: string, color?: string) {
  return item.product.id === productId && (item.size ?? "") === (size ?? "") && (item.color ?? "") === (color ?? "");
}

function lineKey(item: CartItem) {
  return `${item.product.id}:${item.size ?? ""}:${item.color ?? ""}`;
}

function capQuantity(product: Product, size: string | undefined, color: string | undefined, quantity: number) {
  const stock = lineStock(product, size, color);
  const max = stock == null ? 20 : Math.min(20, stock);
  return Math.min(max, quantity);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((item) => sameLine(item, action.product.id, action.size, action.color));
      const qty = action.quantity ?? 1;
      const next = capQuantity(action.product, action.size, action.color, (existing?.quantity ?? 0) + qty);
      if (next < 1) return state;
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            sameLine(item, action.product.id, action.size, action.color) ? { ...item, quantity: next } : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: next, size: action.size, color: action.color }],
      };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((item) => !sameLine(item, action.productId, action.size, action.color)),
      };
    case "UPDATE_QTY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => !sameLine(item, action.productId, action.size, action.color)),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          sameLine(item, action.productId, action.size, action.color)
            ? { ...item, quantity: capQuantity(item.product, action.size, action.color, action.quantity) }
            : item
        ),
      };
    }
    case "SET":
      return { ...state, items: action.items };
    case "MERGE_ITEMS": {
      const merged = new Map(state.items.map((item) => [lineKey(item), item]));
      for (const item of action.items) merged.set(lineKey(item), item);
      return { ...state, items: [...merged.values()] };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
}

interface CartContextValue extends CartState {
  ready: boolean;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function rememberGuest(data: { guestToken?: string }) {
  rememberGuestToken(data.guestToken);
}

async function pullCart() {
  const request = store.dispatch(cartApi.endpoints.getCart.initiate(undefined, { forceRefetch: true, subscribe: false }));
  try {
    const data = await request.unwrap();
    rememberGuest(data);
    return (data.items ?? []) as CartItem[];
  } finally {
    request.unsubscribe();
  }
}

async function sendCart<T>(request: { unwrap: () => Promise<T>; unsubscribe?: () => void }) {
  try {
    return await request.unwrap();
  } finally {
    request.unsubscribe?.();
  }
}

export function CartProvider({
  children,
  initialItems = [],
}: {
  children: React.ReactNode;
  initialItems?: CartItem[];
}) {
  const [state, dispatch] = useReducer(cartReducer, initialItems, (items) => ({
    items: items.filter((item) => item?.product?.id && item.product.image && item.quantity > 0),
    isOpen: false,
  }));
  const [ready, setReady] = useState(
    () => initialItems.some((item) => item?.product?.id && item.product.image && item.quantity > 0)
  );
  const generation = useRef(0);
  const queue = useRef(Promise.resolve());

  const run = useCallback((task: (current: number) => Promise<void>) => {
    const current = ++generation.current;
    queue.current = queue.current.then(() => task(current)).catch(() => undefined);
    return queue.current;
  }, []);

  const applyItems = useCallback((current: number, items: CartItem[]) => {
    if (current !== generation.current) return;
    dispatch({ type: "SET", items });
  }, []);

  const loadCart = useCallback(() => {
    run(async (current) => {
      try {
        const items = await pullCart();
        applyItems(current, items);
      } catch {
        // Keep the saved cart on screen if the refresh request fails.
      } finally {
        if (current === generation.current) setReady(true);
      }
    });
  }, [applyItems, run]);

  useLayoutEffect(() => {
    const snapshot = readCartSnapshot<CartItem>().filter(
      (item) => item?.product?.id && item.product.image && item.quantity > 0
    );
    if (snapshot.length) dispatch({ type: "SET", items: snapshot });
  }, []);

  useEffect(() => {
    loadCart();
    window.addEventListener("empulse-customer", loadCart);
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== GUEST_KEY && event.key !== "empulse_customer") return;
      loadCart();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("empulse-customer", loadCart);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadCart]);

  useEffect(() => {
    if (!ready) return;
    writeCartSnapshot(state.items);
  }, [ready, state.items]);

  const addToCart = useCallback(
    (product: Product, quantity = 1, size?: string, color?: string) => {
      dispatch({ type: "ADD", product, quantity, size, color });
      run(async (current) => {
        try {
          const data = await sendCart(
            store.dispatch(
              cartApi.endpoints.addCartItem.initiate({
                productId: product.id,
                quantity,
                size: size ?? "",
                color: color ?? "",
              })
            )
          );
          rememberGuest(data);
          if (current === generation.current) applyItems(current, data.items ?? []);
          else dispatch({ type: "MERGE_ITEMS", items: data.items ?? [] });
        } catch {
          const items = await pullCart().catch(() => null);
          if (items) applyItems(current, items);
        }
      });
    },
    [applyItems, run]
  );

  const removeFromCart = useCallback(
    (productId: string, size?: string, color?: string) => {
      dispatch({ type: "REMOVE", productId, size, color });
      run(async (current) => {
        try {
          const data = await sendCart(
            store.dispatch(cartApi.endpoints.removeCartItem.initiate({ productId, size: size ?? "", color: color ?? "" }))
          );
          rememberGuest(data);
          applyItems(current, data.items ?? []);
        } catch {
          const items = await pullCart().catch(() => null);
          if (items) applyItems(current, items);
        }
      });
    },
    [applyItems, run]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: string, color?: string) => {
      dispatch({ type: "UPDATE_QTY", productId, quantity, size, color });
      run(async (current) => {
        try {
          const data = await sendCart(
            store.dispatch(cartApi.endpoints.updateCartItem.initiate({ productId, quantity, size: size ?? "", color: color ?? "" }))
          );
          rememberGuest(data);
          applyItems(current, data.items ?? []);
        } catch {
          const items = await pullCart().catch(() => null);
          if (items) applyItems(current, items);
        }
      });
    },
    [applyItems, run]
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
    return run(async (current) => {
      try {
        const data = await sendCart(store.dispatch(cartApi.endpoints.clearCartItems.initiate()));
        rememberGuest(data);
        applyItems(current, data.items ?? []);
      } catch {
        const items = await pullCart().catch(() => null);
        if (items) applyItems(current, items);
      }
    });
  }, [applyItems, run]);

  const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);
  const toggleCart = useCallback(() => dispatch({ type: "TOGGLE_CART" }), []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const value: CartContextValue = {
    ...state,
    ready,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    itemCount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
