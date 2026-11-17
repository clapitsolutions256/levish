"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Review } from "@/data/reviews";

export type ReviewedProduct = { name: string; image: string };

const FIRST_PAINT = 6; // cards per row sent in the page's HTML; the rest arrive with the moving rows
const CARD_SECONDS = 9; // how long each card takes to pass, so both rows drift at the same calm pace
const AVATAR_TONES = ["bg-[#f3e1e4] text-[#a2485a]", "bg-[var(--sage-tint)] text-[var(--accent)]", "bg-[#efe6d8] text-[#8a6a3b]", "bg-[#e4e6f3] text-[#4d5596]"];

/** Five stars drawn from the one star shape defined in ReviewStarSymbol, so each card adds a few bytes, not five paths. */
export function Stars({ size = 16, value = 5 }: { size?: number; value?: number }) {
  const filled = Math.round(value);
  return (
    <svg width={size * 5 + 8} height={size} viewBox="0 0 108 20" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 22, 44, 66, 88].map((x, i) => (
        <use key={x} href="#review-star" x={x} y={0} width={20} height={20} fill={i < filled ? "#e0a526" : "#e5e1d8"} />
      ))}
    </svg>
  );
}

export function ReviewStarSymbol() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <symbol id="review-star" viewBox="0 0 20 20">
        <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
      </symbol>
    </svg>
  );
}

const monthOf = (date: string) => new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

function ReviewCard({ review, product }: { review: Review; product?: ReviewedProduct }) {
  const productSlug = review.product ?? review.relatedProduct;
  const tone = AVATAR_TONES[review.name.length % AVATAR_TONES.length];
  return (
    // Every card is the same height so the two rows stay even; the quote gets more lines when there is no product below it.
    <figure className="flex h-[17rem] w-[17.5rem] shrink-0 flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[0_10px_30px_-18px_var(--shadow-warm-md)] sm:w-[21rem]">
      <div className="flex items-center justify-between gap-3">
        <div><Stars value={review.rating ?? 5} />{review.paraphrased ? <p className="mt-1 text-[10px] text-[var(--muted)]">Feedback paraphrased</p> : null}</div>
        {review.date ? <span className="text-xs text-[var(--muted)]">{monthOf(review.date)}</span> : null}
      </div>
      <blockquote className="mt-3 text-[0.9rem] leading-relaxed text-[var(--foreground)]" dir="auto">
        <p className={product ? "line-clamp-3" : "line-clamp-6"}>{review.text}</p>
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-4">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${tone}`}>{review.name.charAt(0)}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--foreground)]">{review.name}</span>
        {review.photo ? (
          <Image src={review.photo} alt={`Photo from ${review.name}`} width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg bg-[var(--cream)] object-cover" />
        ) : null}
      </figcaption>
      {product && productSlug ? (
        <Link
          href={`/product/${productSlug}`}
          className="mt-3 flex items-center gap-3 rounded-xl bg-[var(--sage-tint)] p-2 pr-3 transition-colors hover:bg-[var(--cream)]"
        >
          <Image src={product.image} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] uppercase tracking-wide text-[var(--muted)]">{review.product ? "Reviewed" : "Explore"}</span>
            <span className="block truncate text-xs font-medium text-[var(--foreground)]">{product.name}</span>
          </span>
        </Link>
      ) : null}
    </figure>
  );
}

function Row({ list, reverse, products, looping }: { list: Review[]; reverse?: boolean; products: Record<string, ReviewedProduct>; looping: boolean }) {
  return (
    <div className="overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
      {/* The page's HTML holds the first few cards; the full row and its second copy are added in the browser,
          and sliding by half the width then loops without a jump. */}
      <div
        className={`flex w-max gap-5 hover:[animation-play-state:paused] ${looping ? (reverse ? "ticker-scroll-ltr" : "ticker-scroll") : ""}`}
        style={{ animationDuration: `${list.length * CARD_SECONDS}s` }}
      >
        {(looping ? [...list, ...list] : list.slice(0, FIRST_PAINT)).map((review, i) => (
          <div key={i} aria-hidden={i >= list.length || undefined} className="flex">
            <ReviewCard review={review} product={products[review.product ?? review.relatedProduct ?? ""]} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** One moving row below the featured review cards. */
export function ReviewsMarquee({ reviews, products }: { reviews: Review[]; products: Record<string, ReviewedProduct> }) {
  const [looping, setLooping] = useState(false);
  useEffect(() => setLooping(true), []);
  return (
    <>
      <Row list={reviews} products={products} looping={looping} />
    </>
  );
}
