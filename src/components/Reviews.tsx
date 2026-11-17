import Image from "next/image";
import Link from "next/link";
import { reviews, type Review } from "@/data/reviews";
import { ReviewStarSymbol, ReviewsMarquee, Stars, type ReviewedProduct } from "@/components/ReviewsMarquee";

export type { ReviewedProduct };

function Summary() {
  const photos = reviews.filter((review) => review.photo);
  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 md:p-7">
      <div className="flex items-end gap-3">
        <span className="font-display text-5xl font-semibold leading-none text-[var(--foreground)]">5.0</span>
        <span className="pb-1 text-sm text-[var(--muted)]">out of 5</span>
      </div>
      <div className="mt-3">
        <Stars size={20} />
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">Based on {reviews.filter((review) => !review.paraphrased || review.rating === 5).length} rated customer reviews</p>
      <ul className="mt-5 space-y-1.5" aria-label="Rating breakdown">
        {[5, 4, 3, 2, 1].map((stars) => {
          const share = stars === 5 ? 100 : 0;
          return (
            <li key={stars} className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="w-8 text-right">{stars} ★</span>
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
              <Image
                key={review.photo}
                src={review.photo!}
                alt={`Photo from ${review.name}`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl bg-[var(--cream)] object-cover"
              />
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
            className="group flex w-[15rem] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white transition-shadow hover:shadow-[0_16px_40px_-20px_var(--shadow-warm-md)] sm:w-auto"
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
              <Stars size={14} />
              {quote.paraphrased ? <p className="mt-1 text-xs text-[var(--muted)]">Feedback paraphrased</p> : null}
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

/** What customers have said: a rating summary, the most reviewed pieces, then one moving row of reviews. */
export function Reviews({ products }: { products: Record<string, ReviewedProduct> }) {
  if (!reviews.length) return null;
  return (
    <section className="relative bg-[var(--sage-tint)]/50 py-16 md:py-24" aria-label="Customer reviews">
      <ReviewStarSymbol />
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <div className="mb-8 text-center md:mb-10">
          <p className="eyebrow mb-2">Customer love</p>
          <h2 className="section-heading">What our customers say</h2>
          <p className="type-copy mx-auto mt-3 max-w-xl text-[var(--muted)]">
            Feedback from our customers across Pakistan.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[19rem_1fr]">
          <Summary />
          <MostLoved products={products} />
        </div>
      </div>
      <div className="mt-8 md:mt-10">
        <ReviewsMarquee reviews={reviews} products={products} />
      </div>
    </section>
  );
}
