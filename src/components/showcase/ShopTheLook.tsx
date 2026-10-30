"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Product } from "@/types";
import type { Look } from "@/lib/showcase";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/metaPixel";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Sizes in stock for the first colour that has stock; empty when the piece has no sizes.
function sizeOptions(product: Product) {
  const variants = product.variants ?? [];
  const color = variants.find((variant) => variant.stock > 0)?.color;
  const sizes = variants.filter((variant) => variant.color === color && variant.stock > 0).map((variant) => variant.size);
  return { color, sizes: [...new Set(sizes)] };
}

/** "Try the look": a lineup of outfits with the pieces of the focused one ready to add together. */
export function ShopTheLook({ looks }: { looks: Look[] }) {
  const still = useReducedMotion();
  const { addToCart, openCart } = useCart();
  const [active, setActive] = useState(0);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const count = looks.length;
  if (!count) return null;

  const look = looks[active];
  const total = look.items.reduce((sum, item) => sum + item.price, 0);
  const missing = look.items.filter((item) => sizeOptions(item).sizes.length > 0 && !sizes[item.id]);

  const go = (index: number) => {
    setActive((index + count) % count);
    setAdded(false);
  };

  const addLook = () => {
    for (const item of look.items) {
      const { color } = sizeOptions(item);
      addToCart(item, 1, sizes[item.id], sizes[item.id] ? color : undefined);
      trackAddToCart({ id: item.id, name: item.name, category: item.categoryId, price: item.price });
    }
    setAdded(true);
    openCart();
  };

  return (
    <section className="bg-white py-16 md:py-24" aria-label="Shop the look">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-5xl italic leading-none md:text-6xl">Try the look.</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">Whole outfits, styled for you. Drag to browse, then add the full look.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
          {/* Lineup */}
          <div className="relative h-[30rem] overflow-hidden md:h-[36rem]">
            <motion.div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(active + 1);
                else if (info.offset.x > 60) go(active - 1);
              }}
            >
              {looks.map((item, index) => {
                let rel = index - active;
                if (rel > count / 2) rel -= count;
                if (rel < -count / 2) rel += count;
                const distance = Math.abs(rel);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => (rel === 0 ? undefined : go(index))}
                    aria-label={rel === 0 ? `Look ${index + 1}` : `Show look ${index + 1}`}
                    className="absolute bottom-16 left-1/2 top-0 aspect-[3/4] max-w-[70%] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(11,11,11,0.12)]"
                    initial={false}
                    animate={{
                      x: `${-50 + rel * 88}%`,
                      scale: rel === 0 ? 1 : 0.86,
                      opacity: distance > 2 ? 0 : rel === 0 ? 1 : 0.42,
                      filter: rel === 0 ? "blur(0px)" : "blur(3px)",
                    }}
                    transition={still ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 24 }}
                    style={{ zIndex: 10 - distance, pointerEvents: distance > 2 ? "none" : "auto" }}
                  >
                    <Image
                      src={item.items[0].image}
                      alt=""
                      fill
                      draggable={false}
                      sizes="(max-width: 768px) 46vw, 22vw"
                      className="pointer-events-none select-none object-cover"
                    />
                  </motion.button>
                );
              })}
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-between bg-gradient-to-t from-white via-white/80 to-transparent px-1 pb-2">
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{look.gender === "men" ? "Men" : "Women"}</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => go(active - 1)} className="clay flex h-10 w-10 items-center justify-center rounded-full" aria-label="Previous look">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <span className="text-xs tabular-nums text-[var(--muted)]">
                  {pad(active + 1)} / {pad(count)}
                </span>
                <button type="button" onClick={() => go(active + 1)} className="skeuo-ink flex h-10 w-10 items-center justify-center rounded-full" aria-label="Next look">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* In this look */}
          <aside className="glass-solid flex flex-col rounded-[1.75rem] p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">In this look</h3>
              <span className="text-xs text-[var(--muted)]">{look.items.length} pieces</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={look.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: still ? 0 : 0.28 }}
                className="mt-4 flex-1 divide-y divide-black/5"
              >
                {look.items.map((item) => {
                  const options = sizeOptions(item);
                  return (
                    <li key={item.id} className="flex gap-3 py-3">
                      <Link href={`/product/${item.slug}`} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        {item.brand ? <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{item.brand}</p> : null}
                        <Link href={`/product/${item.slug}`} className="line-clamp-1 text-sm font-medium [&:hover]:!text-[var(--foreground)]">
                          {item.name}
                        </Link>
                        <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
                        {options.sizes.length ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {options.sizes.map((size) => {
                              const chosen = sizes[item.id] === size;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => {
                                    setSizes((current) => ({ ...current, [item.id]: size }));
                                    setAdded(false);
                                  }}
                                  aria-pressed={chosen}
                                  className={`min-w-8 rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                                    chosen ? "clay-ink" : "clay text-[var(--foreground)]/80"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </motion.ul>
            </AnimatePresence>
            <div className="mt-2 border-t border-black/5 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[var(--muted)]">Complete the look</span>
                <span className="text-lg font-semibold">{formatPrice(total)}</span>
              </div>
              <button
                type="button"
                onClick={addLook}
                disabled={missing.length > 0}
                className="skeuo-ink mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {added ? "Added to bag" : missing.length ? `Pick ${missing.length === 1 ? "a size" : "sizes"} to add the look` : "Add full look to bag"}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={added ? "M5 13l4 4L19 7" : "M5 12h14m-6-6l6 6-6 6"} />
                </svg>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
