"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import type { Product } from "@/types";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Editorial "orbit": the section pins while you scroll, and each step brings the next piece to the
 * front of an arc with its name set huge behind it. The index on the left and the arrows jump too.
 */
export function OrbitShowcase({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const [active, setActive] = useState(0);
  const count = products.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setActive((current) => (current === next ? current : next));
  });

  // Scroll to the slice of the pinned section that shows piece `index`.
  const go = (index: number) => {
    const section = ref.current;
    if (!section) return;
    const target = Math.min(count - 1, Math.max(0, index));
    const top = section.getBoundingClientRect().top + window.scrollY;
    const span = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((target + 0.5) / count), behavior: still ? "auto" : "smooth" });
  };

  if (!count) return null;
  const current = products[active];
  const spring = still ? { duration: 0 } : { type: "spring" as const, stiffness: 170, damping: 24 };

  return (
    <section ref={ref} aria-label="The orbit" className="relative bg-white" style={{ height: `${count * 70 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-20 pb-8 md:pt-28">
        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between px-4 sm:px-6">
          <div>
            <p className="eyebrow mb-2">The orbit</p>
            <h2 className="section-heading">Not a store. A runway.</h2>
          </div>
          <p className="hidden text-sm text-[var(--muted)] md:block">Scroll to spin the orbit</p>
        </div>

        <div className="relative mx-auto w-full max-w-[90rem] flex-1">
          {/* Index */}
          <ol className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 space-y-1.5 lg:block">
            {products.map((product, index) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => go(index)}
                  className={`flex items-baseline gap-3 text-left text-[12px] uppercase tracking-[0.14em] transition-colors ${
                    index === active ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted)]/70 hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className="tabular-nums">{pad(index + 1)}</span>
                  <span className="max-w-[12rem] truncate">{product.name}</span>
                </button>
                {index === active ? <p className="pl-8 text-[11px] text-[var(--muted)]">{formatPrice(product.price)}</p> : null}
              </li>
            ))}
          </ol>

          {/* Giant name */}
          <div className="pointer-events-none absolute inset-x-0 top-[38%] -translate-y-1/2 text-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={current.id}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -40, filter: "blur(8px)" }}
                transition={{ duration: still ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="font-display truncate px-4 text-[clamp(3.5rem,10vw,10rem)] italic leading-none text-[var(--foreground)]/15"
              >
                {current.name.split(" ").slice(0, 3).join(" ")}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Arc */}
          <div className="absolute inset-x-0 bottom-52 top-4 md:bottom-28">
            {products.map((product, index) => {
              const rel = index - active;
              const distance = Math.abs(rel);
              const front = rel === 0;
              return (
                <motion.div
                  key={product.id}
                  className="absolute bottom-0 left-1/2 top-0 aspect-[3/4] max-w-[80vw] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(11,11,11,0.12)]"
                  initial={false}
                  animate={{
                    x: `${-50 + rel * (front ? 0 : 78)}%`,
                    y: distance === 0 ? "0%" : "6%",
                    scale: front ? 1 : 0.62,
                    rotate: rel * -7,
                    opacity: distance > 1 ? 0 : front ? 1 : 0.85,
                  }}
                  transition={spring}
                  style={{ zIndex: 10 - distance, pointerEvents: distance > 1 ? "none" : "auto" }}
                >
                  {front ? (
                    <Link href={`/product/${product.slug}`} aria-label={product.name} className="relative block h-full">
                      <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 70vw, 30vw" className="object-cover" />
                    </Link>
                  ) : (
                    <button type="button" onClick={() => go(index)} aria-label={`Show ${product.name}`} className="relative block h-full w-full">
                      <Image src={product.image} alt="" fill sizes="(max-width: 768px) 40vw, 20vw" className="object-cover" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Caption and controls */}
          <div className="absolute inset-x-0 bottom-20 z-20 flex flex-col items-center gap-3 px-4 md:bottom-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: still ? 0 : 0.3 }}
                className="text-center"
              >
                <Link href={`/product/${current.slug}`} className="font-display line-clamp-2 text-2xl italic leading-tight md:text-3xl [&:hover]:!text-[var(--foreground)]">
                  {current.name}
                </Link>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {current.brand ? `${current.brand} · ` : ""}
                  {formatPrice(current.price)}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-4 max-md:-translate-x-6">
              <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className="clay flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40" aria-label="Previous piece">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <span className="hidden text-xs tabular-nums text-[var(--muted)] md:inline">{pad(active + 1)}</span>
              <span className="relative h-[2px] w-20 overflow-hidden rounded-full bg-black/10 md:w-32">
                <motion.span className="absolute inset-0 origin-left rounded-full bg-[var(--accent)]" style={{ scaleX: scrollYProgress }} />
              </span>
              <span className="hidden text-xs tabular-nums text-[var(--muted)] md:inline">{pad(count)}</span>
              <button type="button" onClick={() => go(active + 1)} disabled={active === count - 1} className="skeuo-ink flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40" aria-label="Next piece">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
