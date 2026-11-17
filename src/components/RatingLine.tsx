function Stars({ className, value }: { className: string; value: number }) {
  return (
    <span className="flex" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${className} ${i < Math.round(value) ? "text-[#e0a526]" : "text-[#e5e1d8]"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Stars under a product's name. A product with its own reviews shows their average and how many there are;
 * any other product shows the store's rating, labelled as such, so no product claims reviews it does not have.
 */
export function RatingLine({
  count,
  average,
  storeRating,
  size = "sm",
  linked = false,
}: {
  count?: number;
  average?: number;
  storeRating?: number;
  size?: "sm" | "md";
  /** On the product page the line links to the reviews; inside a card it cannot, the card is already a link. */
  linked?: boolean;
}) {
  const own = Boolean(count);
  const value = own ? (average ?? 5) : storeRating;
  if (!value) return null;
  const star = size === "md" ? "h-[18px] w-[18px]" : "h-3.5 w-3.5";
  const text = own ? `${count} ${count === 1 ? "review" : "reviews"}` : `Store rating ${value.toFixed(1)}`;
  const label = own
    ? `Rated ${value} out of 5 from ${count} ${count === 1 ? "review" : "reviews"}`
    : `Levish store rated ${value} out of 5`;
  const className = `flex w-fit items-center gap-1.5 text-[var(--muted)] ${size === "md" ? "mt-2 text-sm" : "mt-1 text-xs"}`;
  const content = (
    <>
      <Stars className={star} value={value} />
      <span>{text}</span>
    </>
  );
  return linked ? (
    <a href={own ? "#reviews" : "/#customer-reviews"} className={`${className} hover:text-[var(--accent)]`} aria-label={label}>
      {content}
    </a>
  ) : (
    <span className={className} role="img" aria-label={label}>
      {content}
    </span>
  );
}
