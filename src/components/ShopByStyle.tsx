"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type StyleCategory = {
  name: string;
  href: string;
  image: string;
};

const SPEED = 35; // px per second, like the partners strip

export function ShopByStyle({ categories }: { categories: StyleCategory[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const holdUntil = useRef(0);
  const hovering = useRef(false);
  const [looping, setLooping] = useState(false);

  // Loop only when one set of cards is wider than the row.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => {
      const cards = el.querySelectorAll<HTMLElement>("[data-style-card]");
      const count = categories.length;
      const last = cards[count - 1];
      const oneSet = last ? last.offsetLeft + last.offsetWidth - (cards[0]?.offsetLeft ?? 0) : 0;
      setLooping(oneSet > el.clientWidth + 8);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [categories.length]);

  useEffect(() => {
    const el = scroller.current;
    if (!el || !looping) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const loopWidth = () => {
      const cards = el.querySelectorAll<HTMLElement>("[data-style-card]");
      const copy = cards[categories.length];
      return copy ? copy.offsetLeft - cards[0].offsetLeft : 0;
    };

    position.current = el.scrollLeft;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      const width = loopWidth();
      if (Math.abs(el.scrollLeft - position.current) > 2) position.current = el.scrollLeft; // user scrolled
      if (!hovering.current && now > holdUntil.current && width > 0) {
        position.current += SPEED * dt;
        if (position.current >= width) position.current -= width;
        el.scrollLeft = position.current;
      } else if (width > 0 && el.scrollLeft >= width) {
        position.current = el.scrollLeft - width;
        el.scrollLeft = position.current;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [looping, categories.length]);

  const pause = (ms: number) => {
    holdUntil.current = performance.now() + ms;
  };

  const scrollByCard = (direction: number) => {
    const el = scroller.current;
    if (!el) return;
    pause(1500);
    const cards = el.querySelectorAll<HTMLElement>("[data-style-card]");
    const card = cards[0];
    const amount = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    if (looping && direction < 0 && el.scrollLeft < amount) {
      const copy = cards[categories.length];
      if (copy) el.scrollLeft += copy.offsetLeft - cards[0].offsetLeft;
    }
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const items = looping ? [...categories, ...categories] : categories;

  if (!categories.length) return null;

  return (
    <section className="py-14 md:py-16" aria-label="Shop by style">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Explore</p>
            <h2 className="section-heading">Shop By Style</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous styles"
              onClick={() => scrollByCard(-1)}
              className="clay flex h-11 w-11 items-center justify-center rounded-full text-[var(--accent)] transition disabled:opacity-35"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next styles"
              onClick={() => scrollByCard(1)}
              className="skeuo-ink flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-35"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onMouseEnter={() => (hovering.current = true)}
          onMouseLeave={() => (hovering.current = false)}
          onTouchStart={() => pause(4000)}
          onTouchEnd={() => pause(2500)}
          onWheel={() => pause(2500)}
          onFocus={() => pause(4000)}
        >
          {items.map((category, i) => {
            const index = i % categories.length;
            const copy = i >= categories.length;
            return (
            <Link
              key={`${category.name}-${i}`}
              href={category.href}
              data-style-card
              aria-hidden={copy || undefined}
              tabIndex={copy ? -1 : undefined}
              className="group w-[72vw] shrink-0 sm:w-[230px] md:w-[250px]"
            >
              <div
                className={`relative aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-[0_10px_30px_rgba(11,11,11,0.08)] ${
                  category.name === "Shoes" ? "bg-white" : "bg-[var(--cream)]"
                }`}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className={
                    category.name === "Shoes"
                      ? "object-contain object-center"
                      : "object-cover transition duration-700 ease-out group-hover:scale-105"
                  }
                  sizes="250px"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--foreground)]/80 via-[var(--foreground)]/25 to-transparent px-4 pb-4 pt-20">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="section-heading mt-1 text-white">{category.name}</p>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
