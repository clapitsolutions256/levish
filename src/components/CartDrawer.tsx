"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { galleryFor, lineStock } from "@/lib/variants";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    itemCount,
    total,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
        aria-hidden
      />
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md max-h-[100dvh] sm:max-h-none bg-[var(--card)] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"}`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0 pt-[env(safe-area-inset-top)]">
          <div>
            <h2 className="section-heading">Your Cart</h2>
            {itemCount > 0 && (
              <p className="text-xs text-[var(--muted)] mt-0.5">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-xl text-[#4a142a] hover:bg-[var(--cream)] transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--cream)] flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-[var(--muted)] font-medium mb-1">Your cart is empty</p>
              <p className="text-sm text-[var(--muted)]/70">Add some cozy items to get started.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const stock = lineStock(item.product, item.size, item.color);
                const atLimit = stock != null && item.quantity >= stock;
                return (
                <li
                  key={`${item.product.id}-${item.size ?? ""}-${item.color ?? ""}`}
                  className="flex gap-4 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]/50"
                >
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-[var(--cream)] shrink-0">
                    <Image
                      src={galleryFor(item.product, item.color)[0] || item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2 leading-snug">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {item.color || item.product.color}
                      {item.size && ` · ${item.size}`}
                    </p>
                    <p className="text-sm font-semibold mt-1.5">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, Math.max(0, item.quantity - 1), item.size, item.color)
                        }
                        className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-sm hover:bg-[var(--cream)] transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={atLimit}
                        onClick={() => {
                          if (atLimit) return;
                          updateQuantity(item.product.id, item.quantity + 1, item.size, item.color);
                        }}
                        className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-sm hover:bg-[var(--cream)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        className="ml-auto text-xs text-[var(--muted)] hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {stock === 0 ? (
                      <p className="mt-1.5 text-xs text-red-700">Out of stock</p>
                    ) : atLimit ? (
                      <p className="mt-1.5 text-xs text-[#4a142a]">Only {stock} available</p>
                    ) : null}
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 pb-[env(safe-area-inset-bottom)] border-t border-[var(--border)] bg-[var(--cream)] shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[var(--muted)]">Subtotal</span>
              <span className="text-lg font-semibold">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full justify-center"
            >
              Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-center text-xs text-[var(--muted)] mt-3">Free shipping on orders above Rs. 5,000</p>
          </div>
        )}
      </div>
    </>
  );
}
