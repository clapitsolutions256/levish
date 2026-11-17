import Image from "next/image";
import type { Review } from "@/data/reviews";
import { averageRating } from "@/lib/reviews";
import { WriteReview, type ReviewableProduct } from "@/components/WriteReview";

const SHOWN = 6;

function Stars({ size = "h-4 w-4", value = 5 }: { size?: string; value?: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${size} ${i < Math.round(value) ? "text-[#e0a526]" : "text-[#e5e1d8]"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
        <Stars size="h-3.5 w-3.5" value={review.rating ?? 5} />
        {review.paraphrased ? <p className="mt-1 text-xs text-[var(--muted)]">Feedback paraphrased</p> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]" dir="auto">
        {review.text}
      </p>
      {(review.photos?.length ? review.photos : review.photo ? [review.photo] : []).length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {(review.photos?.length ? review.photos : [review.photo!]).map((photo, index) => (
            <a key={photo} href={photo} target="_blank" rel="noopener noreferrer">
              <Image
                src={photo}
                alt={`Photo ${index + 1} from ${review.name}`}
                width={96}
                height={96}
                className="h-24 w-24 rounded-xl bg-[var(--cream)] object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}
    </li>
  );
}

/** What customers said about this product, and a button to add a review. The first few show; the rest open on tap. */
export function ProductReviews({ reviews, product }: { reviews: Review[]; product: ReviewableProduct }) {
  const rated = reviews.filter((review) => !review.paraphrased || review.rating);
  const average = averageRating(rated);
  return (
    <section id="reviews" className="mt-16 scroll-mt-28 border-t border-[var(--border)] pt-12" aria-label="Customer reviews">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-heading">Customer reviews</h2>
          <div className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
            {rated.length > 0 ? <Stars value={average} /> : null}
            <span>
              {rated.length > 0 ? (
                <>
                  <strong className="text-[var(--foreground)]">{average.toFixed(1)}</strong> from {rated.length} rated {rated.length === 1 ? "review" : "reviews"}
                </>
              ) : reviews.length ? (
                "Customer feedback"
              ) : (
                "No reviews yet. Be the first to review this product."
              )}
            </span>
          </div>
        </div>
        <WriteReview product={product} />
      </div>
      {reviews.length ? <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, SHOWN).map((review) => (
          <ReviewItem key={`${review.name}-${review.date}-${review.text.slice(0, 20)}`} review={review} />
        ))}
      </ul> : null}
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
