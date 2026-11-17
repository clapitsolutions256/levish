"use client";

import { useState } from "react";
import { apiError } from "@/store/apiError";
import { useDeleteReviewMutation, useGetReviewsQuery, useSetReviewStatusMutation, type AdminReview } from "@/store/adminApi";

const TABS: { status: AdminReview["status"]; label: string }[] = [
  { status: "pending", label: "Waiting" },
  { status: "approved", label: "Live on site" },
  { status: "rejected", label: "Rejected" },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="flex" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < value ? "text-[#e0a526]" : "text-gray-200"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/** Customer reviews from the site. Approving one puts it live on the home page and its product page. */
export function ReviewsManager() {
  const { data: reviews = [], isLoading, error } = useGetReviewsQuery();
  const [setStatus, { isLoading: saving }] = useSetReviewStatusMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [tab, setTab] = useState<AdminReview["status"]>("pending");
  const shown = reviews.filter((review) => review.status === tab);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">Reviews customers write on the site. Only approved reviews show to shoppers.</p>
      </div>

      {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{apiError(error, "Could not load reviews.")}</p> : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((item) => {
          const count = reviews.filter((review) => review.status === item.status).length;
          return (
            <button
              key={item.status}
              type="button"
              onClick={() => setTab(item.status)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${tab === item.status ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-700"}`}
            >
              {item.label} <span className={tab === item.status ? "text-white/70" : "text-gray-400"}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-gray-500">Loading reviews…</p> : null}
        {!isLoading && !error && shown.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
            {tab === "pending" ? "No reviews waiting. New ones from customers appear here." : "Nothing here yet."}
          </p>
        ) : null}
        {shown.map((review) => (
          <article key={review.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <Stars value={review.rating} />
                <span className="text-sm font-semibold text-gray-900">{review.name}</span>
                {review.email ? (
                  <a href={`mailto:${review.email}`} className="text-xs text-gray-500 hover:underline">
                    {review.email}
                  </a>
                ) : null}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {review.productSlug ? (
                <a href={`/product/${review.productSlug}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                  {review.productName || review.productSlug}
                </a>
              ) : (
                "General store review"
              )}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800" dir="auto">
              {review.text}
            </p>
            {review.photos.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.photos.map((photo, index) => (
                  <a key={photo} href={photo} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Photo ${index + 1} from ${review.name}`} className="h-24 w-24 rounded-xl bg-gray-100 object-cover" />
                  </a>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {review.status !== "approved" ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setStatus({ id: review.id, status: "approved" })}
                  className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
                >
                  Approve
                </button>
              ) : null}
              {review.status !== "rejected" ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setStatus({ id: review.id, status: "rejected" })}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 disabled:opacity-60"
                >
                  {review.status === "approved" ? "Take off site" : "Reject"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete ${review.name}'s review and its photos? This cannot be undone.`)) deleteReview(review.id);
                }}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
