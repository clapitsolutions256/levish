"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/lib/banners";

export function HeroMedia({ banners }: { banners: Banner[] }) {
  const slides = banners;
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const current = slides[index] ?? slides[0];

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
      className="relative mx-auto aspect-[1122/1402] h-auto w-full overflow-hidden rounded-[28px] bg-[#f4e6ec] md:aspect-[2029/775]"
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
        const picture = (
          <>
            <Image
              src={slide.mobileImage || slide.image}
              alt={slide.alt}
              fill
              priority={slideIndex === 0}
              className="object-cover object-center md:hidden"
              sizes="100vw"
              onLoad={() => setReady((value) => ({ ...value, [`${slide.id}-mobile`]: true }))}
            />
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={slideIndex === 0}
              className="hidden object-cover object-center md:block"
              sizes="100vw"
              onLoad={() => setReady((value) => ({ ...value, [`${slide.id}-desktop`]: true }))}
            />
          </>
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

      {!ready[`${current.id}-mobile`] ? <div className="skeleton absolute inset-0 z-10 md:hidden" aria-hidden /> : null}
      {!ready[`${current.id}-desktop`] ? <div className="skeleton absolute inset-0 z-10 hidden md:block" aria-hidden /> : null}

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#4a142a] shadow"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#4a142a] shadow"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show banner ${slideIndex + 1}`}
                onClick={() => go(slideIndex)}
                className={`h-2 rounded-full shadow transition-all ${slideIndex === index ? "w-6 bg-[#4a142a]" : "w-2 bg-white"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
