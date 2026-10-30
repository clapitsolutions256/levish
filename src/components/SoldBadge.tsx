export function SoldBadge({ large = false }: { large?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/45 backdrop-grayscale">
      <span
        className={`clay-ink rounded-full font-semibold uppercase tracking-[0.18em] ${
          large ? "px-7 py-2.5 text-base" : "px-4 py-1.5 text-xs"
        }`}
      >
        Out of stock
      </span>
    </div>
  );
}
