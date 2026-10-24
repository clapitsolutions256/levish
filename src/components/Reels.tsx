"use client";

import { useEffect, useRef, useState } from "react";

const reels = [{ src: "/kairo/herobgvideo.mp4", label: "Empulse" }];

export function Reels() {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollByCard = (direction: number) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("article");
    const amount = card ? card.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 md:py-20">
      <h2 className="section-heading mb-6">Reels</h2>
      <div className="relative">
        {canPrev && (
          <button
            type="button"
            aria-label="Previous reels"
            onClick={() => scrollByCard(-1)}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#2c2825] shadow-[0_8px_24px_rgba(44,40,37,0.16)] transition hover:bg-[#f4e6ec]"
          >
            <Chevron direction="left" />
          </button>
        )}
        <div
          ref={scroller}
          className="flex gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((reel) => (
            <ReelCard key={reel.src} src={reel.src} label={reel.label} />
          ))}
        </div>
        {canNext && (
          <button
            type="button"
            aria-label="Next reels"
            onClick={() => scrollByCard(1)}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#2c2825] shadow-[0_8px_24px_rgba(44,40,37,0.16)] transition hover:bg-[#f4e6ec]"
          >
            <Chevron direction="right" />
          </button>
        )}
      </div>
    </section>
  );
}

function ReelCard({ src, label }: { src: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const node = frame.current;
    const media = video.current;
    if (!node || !media) return;
    media.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) media.play().catch(() => undefined);
        else media.pause();
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={frame}
      className="relative aspect-[3/4] w-[72vw] max-w-[280px] shrink-0 overflow-hidden rounded-2xl bg-[#ece7e2] sm:w-[240px] md:w-[270px]"
    >
      <video
        ref={video}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={label}
      />
      <button
        type="button"
        aria-label={muted ? "Unmute reel" : "Mute reel"}
        onClick={() => {
          const media = video.current;
          if (!media) return;
          const next = !media.muted;
          media.muted = next;
          setMuted(next);
          media.play().catch(() => undefined);
        }}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#2c2825] shadow-sm"
      >
        {muted ? <MutedIcon /> : <SoundIcon />}
      </button>
    </article>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11 5L6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11 5L6 9H3v6h3l5 4V5zM16 9a5 5 0 010 6M19 7a8 8 0 010 10" />
    </svg>
  );
}
