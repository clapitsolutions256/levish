"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { flyProductToCart } from "@/lib/flyToCart";
import { findVariant, galleryFor, hasPairedSizes, joinPairedSize, splitPairedSize, uniqueValues } from "@/lib/variants";
import { trackAddToCart } from "@/lib/metaPixel";
import { SizeChartButton } from "@/components/SizeChart";

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
  const router = useRouter();
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
  const allSizes = useMemo(() => uniqueValues(variants, "size"), [variants]);
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

  // Sets: the top and the bottom are sized separately, in two rows.
  const paired = hasPairedSizes(variants);
  const tops = useMemo(() => [...new Set(sizes.map((item) => splitPairedSize(item).top))], [sizes]);
  const bottoms = useMemo(() => [...new Set(sizes.map((item) => splitPairedSize(item).bottom))], [sizes]);
  const activePair = splitPairedSize(activeSize);
  // The size a half's button would pick: the other half stays when that pair exists.
  const pairWith = (half: "top" | "bottom", value: string) => {
    const exact = half === "top" ? joinPairedSize(value, activePair.bottom) : joinPairedSize(activePair.top, value);
    return sizes.includes(exact) ? exact : sizes.find((item) => splitPairedSize(item)[half] === value) ?? exact;
  };

  function sizeButton(label: string, value: string, isActive: boolean) {
    const unavailable = (findVariant(variants, value, activeColor)?.stock ?? 0) < 1;
    return (
      <button
        key={label}
        type="button"
        disabled={unavailable}
        aria-label={unavailable ? `${label}, out of stock` : label}
        aria-pressed={isActive}
        onClick={() => {
          setSize(value);
          setMessage("");
        }}
        className={`min-w-11 rounded-lg border px-3 py-2 text-sm ${
          isActive && !unavailable
            ? "border-[var(--accent)] bg-[var(--sage-tint)] text-[var(--accent)]"
            : "border-[var(--border)] bg-white text-[var(--foreground)]"
        } ${unavailable ? "cursor-not-allowed line-through opacity-40" : ""}`}
      >
        {label}
      </button>
    );
  }

  function chooseColor(next: string) {
    setColor(next);
    setMessage("");
    const nextSizes = uniqueValues(variants.filter((variant) => variant.color === next), "size");
    if ((findVariant(variants, activeSize, next)?.stock ?? 0) < 1) setSize(firstInStock(nextSizes, next));
  }

  useEffect(() => {
    onColorChange?.(activeColor);
  }, [activeColor, onColorChange]);

  /** Puts the chosen size and colour in the bag and tells the pixels. False if nothing could be added. */
  function add(options?: { openBag?: boolean }) {
    if (tracked && !selected) {
      setMessage("Choose a size and color.");
      return false;
    }
    if (out || atLimit) return false;
    addToCart(product, 1, activeSize, activeColor, options);
    trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.categoryId,
      price: product.price,
    });
    return true;
  }

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

      {paired ? (
        <>
          {[
            { half: "top" as const, label: "Top size", values: tops, chart: tops },
            { half: "bottom" as const, label: "Bottom size", values: bottoms, chart: bottoms },
          ].map((row) => (
            <div key={row.half} className={compact ? "mt-3" : "mt-5"}>
              <p className="text-sm font-medium text-[var(--foreground)]">{row.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {row.values.map((value) => sizeButton(value, pairWith(row.half, value), activePair[row.half] === value))}
              </div>
              <div className={compact ? "mt-2.5" : "mt-3.5"}>
                <SizeChartButton product={product} sizes={row.chart} label={`${row.label} chart`} />
              </div>
            </div>
          ))}
        </>
      ) : sizes.length > 0 ? (
        <div className={compact ? "mt-3" : "mt-5"}>
          <p className="text-sm font-medium text-[var(--foreground)]">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((item) => sizeButton(item, item, item === activeSize))}
          </div>
          <div className={compact ? "mt-2.5" : "mt-3.5"}>
            <SizeChartButton product={product} sizes={allSizes} />
          </div>
        </div>
      ) : (
        <div className={compact ? "mt-3" : "mt-5"}>
          <SizeChartButton product={product} sizes={allSizes} />
        </div>
      )}

      {atLimit ? (
        <p className={`${compact ? "mt-2" : "mt-4"} text-sm text-[var(--muted)]`}>
          You have all the available pieces of this size in your bag.
        </p>
      ) : null}
      {message ? <p className="mt-2 text-sm text-red-700">{message}</p> : null}

      {/* Two ways to buy: "Shop now" puts the piece in the bag and goes straight to checkout (shoppers here
          read it more easily than "Add to cart"); "Add to cart" keeps them shopping and opens the bag. */}
      {out ? (
        <button
          type="button"
          disabled
          className={`${compact ? "mt-2 py-3" : "mt-4 py-4"} skeuo-ink w-full cursor-not-allowed rounded-full px-10 font-medium opacity-50 md:w-auto`}
        >
          Out of stock
        </button>
      ) : (
        <div className={`${compact ? "mt-2" : "mt-4"} flex gap-2 md:gap-3`}>
          <button
            type="button"
            onClick={() => {
              if (atLimit) {
                onAdded?.();
                router.push("/checkout");
                return;
              }
              if (!add({ openBag: false })) return;
              onAdded?.();
              router.push("/checkout");
            }}
            className={`${compact ? "py-3" : "py-4"} skeuo-ink flex-1 rounded-full px-6 font-medium md:flex-none md:px-10`}
          >
            {atLimit ? "Go to checkout" : "Shop now"}
          </button>
          <button
            type="button"
            disabled={atLimit}
            onClick={(event) => {
              if (!add()) return;
              flyProductToCart(event.currentTarget, galleryFor(product, activeColor)[0] || product.image);
              onAdded?.();
            }}
            className={`${compact ? "py-3" : "py-4"} skeuo flex-1 rounded-full px-6 font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-10`}
          >
            {atLimit ? "In your bag" : "Add to cart"}
          </button>
        </div>
      )}
    </div>
  );
}
