"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

export type StackPanel = {
  word: string;
  href: string;
  line: string;
  count: number;
  links: { label: string; href: string }[];
  pieces: { id: string; slug: string; name: string; image: string }[];
  tone: "sage" | "ink" | "paper";
};

const tones = {
  sage: { card: "bg-[var(--sage)] text-[var(--foreground)]", muted: "text-[var(--foreground)]/65", chip: "clay", glow: "bg-white/40" },
  ink: { card: "bg-[#0d0e0d] text-white", muted: "text-white/60", chip: "glass-dark", glow: "bg-[var(--sage)]/25" },
  paper: { card: "bg-white text-[var(--foreground)]", muted: "text-[var(--muted)]", chip: "clay", glow: "bg-[var(--sage)]/35" },
};

const pad = (n: number) => String(n).padStart(2, "0");

// Resting spots for the fanned cards once the panel has arrived.
const fan = [
  { x: -150, y: 26, rotate: -14 },
  { x: -50, y: -8, rotate: -5 },
  { x: 50, y: -8, rotate: 5 },
  { x: 150, y: 26, rotate: 14 },
];

function FanCard({ piece, index, spread }: { piece: StackPanel["pieces"][number]; index: number; spread: MotionValue<number> }) {
  const spot = fan[index] ?? fan[0];
  const x = useTransform(spread, [0, 1], [0, spot.x]);
  const y = useTransform(spread, [0, 1], [40, spot.y]);
  const rotate = useTransform(spread, [0, 1], [0, spot.rotate]);
  return (
    <motion.div style={{ x, y, rotate, zIndex: index === 1 || index === 2 ? 2 : 1 }} className="absolute left-1/2 top-1/2 -ml-[6.5rem] -mt-[8.75rem] md:-ml-[7.5rem] md:-mt-[10rem]">
      <motion.div whileHover={{ y: -18, scale: 1.04 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        <Link
          href={`/product/${piece.slug}`}
          aria-label={piece.name}
          className="relative block h-[17.5rem] w-[13rem] overflow-hidden rounded-[1.6rem] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/5 md:h-[20rem] md:w-[15rem]"
        >
          <Image src={piece.image} alt={piece.name} fill sizes="240px" className="object-cover" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function Panel({ panel, index, total, stack }: { panel: StackPanel; index: number; total: number; stack: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const tone = tones[panel.tone];
  // The fan opens while this panel slides into place.
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const spread = useTransform(arrive, [0.25, 1], still ? [1, 1] : [0, 1]);
  const wordX = useTransform(arrive, [0, 1], still ? ["0%", "0%"] : ["-12%", "0%"]);
  // Once later panels cover this one, it sinks back.
  const start = index / total;
  const scale = useTransform(stack, [start, 1], still ? [1, 1] : [1, 1 - (total - index) * 0.05]);
  const dim = useTransform(stack, [start, Math.min(1, start + 1 / total)], [0, index === total - 1 ? 0 : 0.35]);

  return (
    <div ref={ref} className="sticky top-0 flex h-[100svh] items-start justify-center px-3 pt-[calc(1rem+var(--stack-offset))] sm:px-6 md:items-center md:pt-[calc(5.5rem+var(--stack-offset))]" style={{ "--stack-offset": `${index * 16}px` } as React.CSSProperties}>
      <motion.article
        style={{ scale }}
        className={`relative h-[calc(100svh-8.75rem)] w-full md:h-[calc(100svh-8rem)] max-w-[90rem] origin-top overflow-hidden rounded-[2.5rem] shadow-[0_-20px_60px_rgba(11,11,11,0.12)] ${tone.card}`}
      >
        <div className={`pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl ${tone.glow}`} aria-hidden="true" />
        <div className="relative grid h-full gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-12">
          <div className="flex flex-col justify-between">
            <div className={`flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] ${tone.muted}`}>
              <span className="tabular-nums">{pad(index + 1)}</span>
              <span className="h-px w-10 bg-current opacity-50" aria-hidden="true" />
              <span className="tabular-nums">{pad(total)}</span>
            </div>
            <div>
              <motion.h2 style={{ x: wordX }} className="font-display text-[4.75rem] italic leading-[0.85] md:text-[10rem]">
                {panel.word}
              </motion.h2>
              <p className={`mt-4 max-w-sm text-sm md:text-base ${tone.muted}`}>{panel.line}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {panel.links.map((link) => (
                  <Link key={link.href} href={link.href} className={`${tone.chip} rounded-full px-4 py-1.5 text-xs font-medium [&:hover]:!text-inherit`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex gap-2 md:hidden">
              {panel.pieces.slice(0, 3).map((piece) => (
                <Link key={piece.id} href={`/product/${piece.slug}`} aria-label={piece.name} className="relative h-36 flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                  <Image src={piece.image} alt={piece.name} fill sizes="30vw" className="object-cover" />
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={panel.href}
                className={`group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${
                  panel.tone === "ink" ? "clay-sage [&:hover]:!text-[var(--foreground)]" : "skeuo-ink [&:hover]:!text-white"
                }`}
              >
                Shop {panel.word.toLowerCase()}
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </Link>
              <span className={`text-sm ${tone.muted}`}>{panel.count} pieces</span>
            </div>
          </div>

          <div className="relative hidden md:block">
            {panel.pieces.map((piece, pieceIndex) => (
              <FanCard key={piece.id} piece={piece} index={pieceIndex} spread={spread} />
            ))}
          </div>
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" aria-hidden="true" />
      </motion.article>
    </div>
  );
}

/** Full-screen section panels that stack over each other as you scroll, each fanning out its pieces. */
export function StackedSections({ panels }: { panels: StackPanel[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section ref={ref} aria-label="Shop by section" className="relative">
      {panels.map((panel, index) => (
        <Panel key={panel.word} panel={panel} index={index} total={panels.length} stack={scrollYProgress} />
      ))}
    </section>
  );
}
