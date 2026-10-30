"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { Product } from "@/types";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

const rise = {
  hidden: { opacity: 0, y: 28 },
  shown: (delay: number) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } }),
};

/** Giant word behind a featured piece, with glass cards drifting at different scroll speeds. */
export function Spotlight({ product, pieceCount }: { product: Product; pieceCount: number }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const wordX = useTransform(scrollYProgress, [0, 1], still ? ["0%", "0%"] : ["12%", "-22%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [60, -60]);
  const slow = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [40, -40]);
  const fast = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [110, -110]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-b from-[var(--background)] via-[var(--sage-tint)] to-[var(--background)] py-16 md:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <motion.div variants={rise} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.6 }} custom={0} className="relative z-20 max-w-xl">
          <p className="eyebrow mb-3">Levish · Since day one</p>
          <h1 className="section-heading">Original fashion, shoes and accessories</h1>
          <p className="type-copy mt-3 text-[var(--muted)]">
            Original brands for men and women, nationwide delivery, and free shipping on orders above Rs. 5,000.
          </p>
        </motion.div>

        <div className="relative mt-4 h-[27rem] md:mt-0 md:h-[40rem]">
          <motion.p
            aria-hidden="true"
            style={{ x: wordX }}
            className="font-display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-[30vw] italic leading-none text-[var(--sage)]/55 md:text-[19vw]"
          >
            Original
          </motion.p>

          <motion.div style={{ y: imageY }} className="absolute inset-y-[8%] left-1/2 aspect-[3/4] max-w-[64vw] -translate-x-1/2 md:inset-y-[6%] md:max-w-[78vw]">
            <Link href={`/product/${product.slug}`} aria-label={product.name} className="animate-float relative block h-full overflow-hidden rounded-[2.25rem] bg-white shadow-[0_40px_90px_rgba(11,11,11,0.2)]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority={false}
                sizes="(max-width: 768px) 78vw, 26rem"
                className="object-cover"
              />
            </Link>
          </motion.div>

          <motion.div style={{ y: slow }} className="absolute left-0 top-2 z-10 md:left-[6%] md:top-16">
            <motion.div variants={rise} initial="hidden" whileInView="shown" viewport={{ once: true }} custom={0.1} className="glass rounded-3xl px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sage-deep)]">Verified</p>
              <p className="mt-0.5 text-lg font-semibold">100% original</p>
            </motion.div>
          </motion.div>

          <motion.div style={{ y: fast }} className="absolute right-0 top-20 z-10 hidden md:right-[8%] md:top-24 md:block">
            <motion.div variants={rise} initial="hidden" whileInView="shown" viewport={{ once: true }} custom={0.2} className="glass rounded-3xl px-4 py-3 text-right">
              <p className="text-3xl font-semibold tracking-tight">{pieceCount}+</p>
              <p className="text-xs text-[var(--muted)]">pieces in store</p>
            </motion.div>
          </motion.div>

          <motion.div style={{ y: fast }} className="absolute bottom-0 right-0 z-10 md:bottom-16 md:left-[10%] md:right-auto">
            <motion.div variants={rise} initial="hidden" whileInView="shown" viewport={{ once: true }} custom={0.3} className="glass flex w-[15.5rem] items-center gap-3 rounded-3xl p-2.5 md:w-[17rem]">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-white">
                <Image src={product.image} alt="" fill sizes="56px" className="object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                {product.brand ? <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{product.brand}</p> : null}
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
              </div>
              <Link href={`/product/${product.slug}`} className="skeuo-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-full [&:hover]:!text-white" aria-label={`Shop ${product.name}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div style={{ y: slow }} className="absolute bottom-10 right-0 z-10 hidden md:right-[6%] md:block">
            <motion.div variants={rise} initial="hidden" whileInView="shown" viewport={{ once: true }} custom={0.4} className="glass-dark rounded-3xl px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">First check, then pay</p>
              <p className="mt-0.5 text-sm text-white/80">Free shipping over Rs. 5,000</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
