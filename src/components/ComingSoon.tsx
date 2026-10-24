import Link from "next/link";
import { PAUSED_NOTICE, PRODUCTS_PAUSED } from "@/lib/storeStatus";

export function ComingSoon({
  title,
  text,
  href = "/",
  cta = "Continue Shopping",
}: {
  title: string;
  text: string;
  href?: string;
  cta?: string;
}) {
  if (PRODUCTS_PAUSED) return <ProductsPausedNotice />;
  return (
    <div className="py-16 text-center animate-fade-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a142a]">Coming Soon</p>
      <h2 className="section-heading mt-3">{title}</h2>
      <p className="type-copy mx-auto mt-3 max-w-md text-[var(--muted)]">{text}</p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-sm font-medium hover:border-[#4a142a] hover:text-[#4a142a]"
      >
        {cta}
      </Link>
    </div>
  );
}

// Shown wherever products would be while PRODUCTS_PAUSED is on.
export function ProductsPausedNotice() {
  return (
    <div className="py-16 text-center animate-fade-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a142a]">{PAUSED_NOTICE.label}</p>
      <h2 className="section-heading mt-3">{PAUSED_NOTICE.title}</h2>
      <p className="type-copy mx-auto mt-3 max-w-md text-[var(--muted)]">{PAUSED_NOTICE.text}</p>
    </div>
  );
}

export function whoLabel(gender: string) {
  if (gender === "women") return "Ladies'";
  return "";
}
