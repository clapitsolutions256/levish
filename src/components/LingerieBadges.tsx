import { sameType } from "@/lib/productTypes";

export function LingerieBadges({
  subcategory,
  compact = false,
}: {
  subcategory?: string;
  compact?: boolean;
}) {
  if (!sameType(subcategory, "undergarments") && !sameType(subcategory, "lingerie")) return null;

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      {!compact ? (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sage-deep)]">
          Imported Lingerie
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {["Imported", "100% Original", "Branded"].map((label, index) => (
          <span
            key={label}
            className={`inline-flex items-center rounded-full border px-2 py-1 font-semibold leading-none ${
              compact ? "text-[10px]" : "text-xs"
            } ${
              index === 0
                ? "border-[var(--sage-deep)] bg-[var(--sage-deep)] text-white"
                : "border-[var(--sage)] bg-[var(--sage-tint)] text-[var(--sage-deep)]"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
