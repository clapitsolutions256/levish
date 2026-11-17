import Image from "next/image";
import type { Review } from "@/data/reviews";

const SHOWN = 6;

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

function ReviewItem({ review }: { review: Review }) {
  return (
    <li className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--foreground)]">{review.name}</span>
        {review.date ? <time dateTime={review.date} className="text-xs text-[var(--muted)]">
          {new Date(review.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </time> : null}
      </div>
      <div className="mt-2">
        <Stars size="h-3.5 w-3.5" />
        {review.paraphrased ? <p className="mt-1 text-xs text-[var(--muted)]">Feedback paraphrased</p> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]" dir="auto">
        {review.text}
      </p>
      {review.photo ? (
        <Image
          src={review.photo}
          alt={`Photo from ${review.name}`}
          width={96}
          height={96}
          className="mt-3 h-24 w-24 rounded-xl bg-[var(--cream)] object-cover"
        />
      ) : null}
    </li>
  );
}

/** What customers said about this product. The first few show; the rest open on tap. */
export function ProductReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const ratedCount = reviews.filter((review) => !review.paraphrased || review.rating === 5).length;
  return (
    <section id="reviews" className="mt-16 scroll-mt-28 border-t border-[var(--border)] pt-12" aria-label="Customer reviews">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-heading">Customer reviews</h2>
          <div className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
            {ratedCount > 0 ? <Stars /> : null}
            <span>
              {ratedCount > 0 ? <><strong className="text-[var(--foreground)]">5.0</strong> from {ratedCount} rated reviews</> : "Customer feedback"}
            </span>
          </div>
        </div>
      </div>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, SHOWN).map((review) => (
          <ReviewItem key={`${review.name}-${review.date}-${review.text.slice(0, 20)}`} review={review} />
        ))}
      </ul>
      {reviews.length > SHOWN ? (
        <details className="group mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--sage-tint)] [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show all {reviews.length} reviews</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(SHOWN).map((review) => (
              <ReviewItem key={`${review.name}-${review.date}-${review.text.slice(0, 20)}`} review={review} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
