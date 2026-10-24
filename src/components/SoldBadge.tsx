export function SoldBadge({ large = false }: { large?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/35">
      <span
        className={`rounded-full bg-[#4a142a] font-semibold uppercase tracking-[0.2em] text-white shadow-lg ${
          large ? "px-7 py-2.5 text-base" : "px-4 py-1.5 text-xs"
        }`}
      >
        Sold
      </span>
    </div>
  );
}
