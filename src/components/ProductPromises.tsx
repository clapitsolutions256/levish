const promises = [
  {
    text: "Cash on delivery available",
    icon: "M3 7h18v10H3V7zm9 2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM6 10v.01M18 14v.01",
  },
  {
    text: "Delivery in 3–7 working days across Pakistan",
    icon: "M3 7h11v8H3V7zm11 3h4l3 3v2h-7v-5zM7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  },
  {
    text: "Free shipping on orders above Rs. 5,000",
    icon: "M20 12v8H4v-8M2 7h20v5H2V7zm10 0v13M12 7H8.5a2.5 2.5 0 110-5C11 2 12 7 12 7zm0 0h3.5a2.5 2.5 0 100-5C13 2 12 7 12 7z",
  },
  {
    text: "Easy returns within 14 days",
    icon: "M4 4v5h5M4.6 15a8 8 0 101.5-8.4L4 9",
  },
];

/** What every order comes with, in plain words, under the buy button. */
export function ProductPromises() {
  return (
    <ul className="mt-5 grid gap-2.5 rounded-2xl border border-[var(--border)] bg-white/60 p-4 text-sm text-[var(--foreground)]">
      {promises.map((item) => (
        <li key={item.text} className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sage-tint)] text-[var(--accent)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={item.icon} />
            </svg>
          </span>
          {item.text}
        </li>
      ))}
    </ul>
  );
}
