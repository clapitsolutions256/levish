"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { flyProductToCart } from "@/lib/flyToCart";
import { findVariant, galleryFor, uniqueValues } from "@/lib/variants";
import { trackAddToCart } from "@/lib/metaPixel";

export function ProductPurchase({
  product,
  onAdded,
  onColorChange,
  compact = false,
  initialColor,
}: {
  product: Product;
  onAdded?: () => void;
  onColorChange?: (color: string) => void;
  compact?: boolean;
  initialColor?: string;
}) {
  const { addToCart, items } = useCart();
  const variants = product.variants ?? [];
  const colors = useMemo(() => uniqueValues(variants, "color"), [variants]);
  // Open on something that can actually be bought: the linked colour, else the first colour with stock.
  const [color, setColor] = useState(
    () =>
      colors.find((item) => item.toLowerCase() === initialColor?.trim().toLowerCase()) ??
      variants.find((variant) => variant.stock > 0)?.color ??
      colors[0] ??
      ""
  );
  const sizes = useMemo(
    () => uniqueValues(variants.filter((variant) => !color || variant.color === color), "size"),
    [variants, color]
  );
  const firstInStock = (list: string[], forColor: string) =>
    list.find((item) => (findVariant(variants, item, forColor)?.stock ?? 0) > 0) ?? list[0] ?? "";
  const [size, setSize] = useState(() => firstInStock(sizes, color));
  const activeSize = sizes.includes(size) ? size : (sizes[0] ?? "");
  const activeColor = colors.includes(color) ? color : (colors[0] ?? "");
  const selected = variants.length ? findVariant(variants, activeSize, activeColor) : undefined;
  const stock = selected?.stock ?? 0;
  const tracked = variants.length > 0;
  const inCart = items.find(
    (item) => item.product.id === product.id && (item.size ?? "") === activeSize && (item.color ?? "") === activeColor
  )?.quantity ?? 0;
  const atLimit = tracked && inCart >= stock && stock > 0;
  const out = tracked && stock < 1;
  const [message, setMessage] = useState("");

  function chooseColor(next: string) {
    setColor(next);
    setMessage("");
    const nextSizes = uniqueValues(variants.filter((variant) => variant.color === next), "size");
    if ((findVariant(variants, activeSize, next)?.stock ?? 0) < 1) setSize(firstInStock(nextSizes, next));
  }

  useEffect(() => {
    onColorChange?.(activeColor);
  }, [activeColor, onColorChange]);

  return (
    <div>
      {colors.length > 0 ? (
        <div className={compact ? "mt-3" : "mt-6"}>
          <p className="text-sm font-medium text-[var(--foreground)]">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseColor(item)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  item === activeColor
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--foreground)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div className={compact ? "mt-3" : "mt-5"}>
          <p className="text-sm font-medium text-[var(--foreground)]">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((item) => {
              const option = findVariant(variants, item, activeColor);
              const unavailable = (option?.stock ?? 0) < 1;
              return (
                <button
                  key={item}
                  type="button"
                  disabled={unavailable}
                  aria-label={unavailable ? `${item}, out of stock` : item}
                  onClick={() => {
                    setSize(item);
                    setMessage("");
                  }}
                  className={`min-w-11 rounded-lg border px-3 py-2 text-sm ${
                    item === activeSize && !unavailable
                      ? "border-[var(--accent)] bg-[var(--sage-tint)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-white text-[var(--foreground)]"
                  } ${unavailable ? "cursor-not-allowed line-through opacity-40" : ""}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {atLimit ? (
        <p className={`${compact ? "mt-2" : "mt-4"} text-sm text-[var(--muted)]`}>
          You have all the available pieces of this size in your bag.
        </p>
      ) : null}
      {message ? <p className="mt-2 text-sm text-red-700">{message}</p> : null}

      <button
        type="button"
        disabled={out || atLimit}
        onClick={(event) => {
          if (tracked && !selected) {
            setMessage("Choose a size and color.");
            return;
          }
          if (out || atLimit) return;
          addToCart(product, 1, activeSize, activeColor);
          trackAddToCart({
            id: product.id,
            name: product.name,
            category: product.categoryId,
            price: product.price,
          });
          flyProductToCart(event.currentTarget, galleryFor(product, activeColor)[0] || product.image);
          onAdded?.();
        }}
        className={`${compact ? "mt-2 py-3" : "mt-4 py-4"} skeuo-ink w-full rounded-full px-10 font-medium disabled:cursor-not-allowed disabled:opacity-50 md:w-auto`}
      >
        {out ? "Out of stock" : atLimit ? "Already in your bag" : "Add to cart"}
      </button>
    </div>
  );
}
