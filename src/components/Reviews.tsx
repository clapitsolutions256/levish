import Image from "next/image";
import Link from "next/link";
import { reviews, type Review } from "@/data/reviews";

export type ReviewedProduct = { name: string; image: string };

const CARD_SECONDS = 9; // how long each card takes to pass, so both rows drift at the same calm pace
const AVATAR_TONES = ["bg-[#f3e1e4] text-[#a2485a]", "bg-[var(--sage-tint)] text-[var(--accent)]", "bg-[#efe6d8] text-[#8a6a3b]", "bg-[#e4e6f3] text-[#4d5596]"];

function Stars({ size = "h-4 w-4" }: { size?: string }) {
  return (
    <span className="flex gap-0.5 text-[#e0a526]" role="img" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const tone = AVATAR_TONES[name.length % AVATAR_TONES.length];
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${tone}`}>
      {name.charAt(0)}
    </span>
  );
}

const monthOf = (date: string) => new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

function ReviewCard({ review, product }: { review: Review; product?: ReviewedProduct }) {
  return (
    // Every card is the same height so the two rows stay even; the quote gets more lines when there is no product below it.
    <figure className="flex h-[17rem] w-[17.5rem] shrink-0 flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[0_10px_30px_-18px_var(--shadow-warm-md)] sm:w-[21rem]">
      <div className="flex items-center justify-between gap-3">
        <Stars />
        <span className="text-xs text-[var(--muted)]">{monthOf(review.date)}</span>
      </div>
      <blockquote className="mt-3 text-[0.9rem] leading-relaxed text-[var(--foreground)]" dir="auto">
        <p className={product ? "line-clamp-3" : "line-clamp-6"}>{review.text}</p>
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-4">
        <Avatar name={review.name} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--foreground)]">{review.name}</span>
        {review.photo ? (
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--cream)]">
            <Image src={review.photo} alt={`Photo from ${review.name}`} fill sizes="40px" className="object-cover" />
          </span>
        ) : null}
      </figcaption>
      {product && review.product ? (
        <Link
          href={`/product/${review.product}`}
          className="mt-3 flex items-center gap-3 rounded-xl bg-[var(--sage-tint)] p-2 pr-3 transition-colors hover:bg-[var(--cream)]"
        >
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
            <Image src={product.image} alt="" fill sizes="48px" className="object-contain" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] uppercase tracking-wide text-[var(--muted)]">Reviewed</span>
            <span className="block truncate text-xs font-medium text-[var(--foreground)]">{product.name}</span>
          </span>
        </Link>
      ) : null}
    </figure>
  );
}

function Row({ list, reverse, products }: { list: Review[]; reverse?: boolean; products: Record<string, ReviewedProduct> }) {
  return (
    <div className="overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
      {/* Two copies side by side, so sliding by half the width loops without a jump. */}
      <div
        className={`flex w-max gap-5 hover:[animation-play-state:paused] ${reverse ? "ticker-scroll-ltr" : "ticker-scroll"}`}
        style={{ animationDuration: `${list.length * CARD_SECONDS}s` }}
      >
        {[...list, ...list].map((review, i) => (
          <div key={i} aria-hidden={i >= list.length || undefined} className="flex">
            <ReviewCard review={review} product={review.product ? products[review.product] : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Summary() {
  const photos = reviews.filter((review) => review.photo);
  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 md:p-7">
      <div className="flex items-end gap-3">
        <span className="font-display text-5xl font-semibold leading-none text-[var(--foreground)]">5.0</span>
        <span className="pb-1 text-sm text-[var(--muted)]">out of 5</span>
      </div>
      <div className="mt-3">
        <Stars size="h-5 w-5" />
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">Based on {reviews.length} customer reviews</p>
      <ul className="mt-5 space-y-1.5" aria-label="Rating breakdown">
        {[5, 4, 3, 2, 1].map((stars) => {
          const share = stars === 5 ? 100 : 0;
          return (
            <li key={stars} className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="w-3 text-right">{stars}</span>
              <svg className="h-3 w-3 text-[#e0a526]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
              </svg>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--sage-tint)]">
                <span className="block h-full rounded-full bg-[#e0a526]" style={{ width: `${share}%` }} />
              </span>
              <span className="w-8 text-right">{share}%</span>
            </li>
          );
        })}
      </ul>
      {photos.length ? (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <p className="mb-3 text-xs uppercase tracking-wide text-[var(--muted)]">Customer photos</p>
          <div className="flex gap-2">
            {photos.map((review) => (
              <div key={review.photo} className="relative h-16 w-16 overflow-hidden rounded-xl bg-[var(--cream)]">
                <Image src={review.photo!} alt={`Photo from ${review.name}`} fill sizes="64px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MostLoved({ products }: { products: Record<string, ReviewedProduct> }) {
  const counts = new Map<string, Review[]>();
  for (const review of reviews) {
    if (review.product && products[review.product]) counts.set(review.product, [...(counts.get(review.product) ?? []), review]);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 3);
  if (!ranked.length) return null;
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {ranked.map(([slug, list]) => {
        const product = products[slug];
        const quote = list.find((review) => review.text.length > 40) ?? list[0];
        return (
          <Link
            key={slug}
            href={`/product/${slug}`}
            className="group flex w-[15rem] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white transition-shadow hover:shadow-[0_16px_40px_-20px_var(--shadow-warm)] sm:w-auto"
          >
            <div className="relative aspect-[4/3] bg-white">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 240px, (max-width: 1024px) 30vw, 22rem"
                className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-[var(--foreground)] px-2.5 py-1 text-[11px] font-medium text-white">
                {list.length} {list.length === 1 ? "review" : "reviews"}
              </span>
            </div>
            <div className="flex flex-1 flex-col border-t border-[var(--border)] p-4">
              <Stars size="h-3.5 w-3.5" />
              <p className="mt-2 line-clamp-1 text-sm font-medium text-[var(--foreground)]">{product.name}</p>
              <p className="mt-2 line-clamp-2 flex-1 text-[13px] italic leading-snug text-[var(--muted)]" dir="auto">
                &ldquo;{quote.text}&rdquo; <span className="not-italic">— {quote.name}</span>
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                Shop now
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/** What customers have said: a rating summary, the most reviewed pieces, then two rows of reviews drifting in opposite directions. */
export function Reviews({ products }: { products: Record<string, ReviewedProduct> }) {
  if (!reviews.length) return null;
  const half = Math.ceil(reviews.length / 2);
  return (
    <section className="bg-[var(--sage-tint)]/50 py-16 md:py-24" aria-label="Customer reviews">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <div className="mb-8 text-center md:mb-10">
          <p className="eyebrow mb-2">Customer love</p>
          <h2 className="section-heading">What our customers say</h2>
          <p className="type-copy mx-auto mt-3 max-w-xl text-[var(--muted)]">
            Real words from women across Pakistan who ordered from us.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[19rem_1fr]">
          <Summary />
          <MostLoved products={products} />
        </div>
      </div>
      <div className="mt-8 md:mt-10">
        <Row list={reviews.slice(0, half)} products={products} />
        <Row list={reviews.slice(half)} reverse products={products} />
      </div>
    </section>
  );
}
