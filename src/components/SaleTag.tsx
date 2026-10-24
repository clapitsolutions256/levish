export function SaleTag({ percent, large = false }: { percent: number; large?: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-red-600 font-semibold uppercase tracking-wide text-white shadow ${
        large ? "right-4 top-4 px-3 py-1 text-sm" : "px-2.5 py-1 text-[10px]"
      }`}
    >
      Sale · {percent}% off
    </span>
  );
}
