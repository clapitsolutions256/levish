"use client";

import { useEffect, useState } from "react";
import { getImageProps } from "next/image";
import Link from "next/link";
import type { Banner } from "@/lib/banners";

export function HeroMedia({ banners }: { banners: Banner[] }) {
  const slides = banners;
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const current = slides[index] ?? slides[0];
  const markReady = (id: string) => setReady((value) => (value[id] ? value : { ...value, [id]: true }));

  useEffect(() => {
    setIndex(0);
  }, [slides.length, slides[0]?.id]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  function go(next: number) {
    const count = slides.length;
    setIndex((next + count) % count);
  }

  return (
    <div
      className="relative mx-3 mt-[calc(var(--header-h,7.5rem)+0.25rem)] h-[calc(100svh-var(--header-h,7.5rem)-6.25rem)] min-h-[30rem] overflow-hidden rounded-[2rem] bg-[var(--sage-tint)] md:mx-0 md:mt-0 md:h-[100svh] md:min-h-0 md:rounded-none"
      onPointerDown={(event) => {
        if (slides.length < 2) return;
        const start = event.clientX;
        const target = event.currentTarget;
        function finish(endEvent: PointerEvent) {
          const delta = endEvent.clientX - start;
          if (delta > 40) go(index - 1);
          if (delta < -40) go(index + 1);
          target.removeEventListener("pointerup", finish);
        }
        target.addEventListener("pointerup", finish);
      }}
    >
      {slides.map((slide, slideIndex) => {
        const visible = slideIndex === index;
        // One <picture> per slide so each device downloads only its own banner.
        const common = { alt: slide.alt, fill: true, sizes: "100vw" };
        const { props: { srcSet: desktopSet } } = getImageProps({ ...common, src: slide.image, quality: 80 });
        const { props: mobileProps } = getImageProps({ ...common, src: slide.mobileImage || slide.image, quality: 75 });
        const first = slideIndex === 0;
        const picture = (
          <picture>
            <source media="(min-width: 768px)" srcSet={desktopSet} sizes="100vw" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              {...mobileProps}
              loading={first ? "eager" : "lazy"}
              fetchPriority={first ? "high" : "auto"}
              decoding={first ? "sync" : "async"}
              className="object-cover object-center"
              // A cached banner can finish before hydration, when onLoad has already passed.
              ref={(img) => {
                if (img?.complete && img.naturalWidth > 0) markReady(slide.id);
              }}
              onLoad={() => markReady(slide.id)}
            />
          </picture>
        );
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={!visible}
          >
            {slide.href ? (
              slide.href.startsWith("/") ? (
                <Link href={slide.href} className="absolute inset-0" aria-label={slide.alt}>
                  {picture}
                </Link>
              ) : (
                <a href={slide.href} className="absolute inset-0" aria-label={slide.alt}>
                  {picture}
                </a>
              )
            ) : (
              picture
            )}
          </div>
        );
      })}

      {!ready[current.id] ? <div className="skeleton absolute inset-0 z-10" aria-hidden /> : null}

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() => go(index - 1)}
            className="glass absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--accent)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={() => go(index + 1)}
            className="glass absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--accent)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show banner ${slideIndex + 1}`}
                onClick={() => go(slideIndex)}
                className={`h-2 rounded-full shadow transition-all ${slideIndex === index ? "w-7 bg-[var(--sage)]" : "w-2 bg-white/80"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
