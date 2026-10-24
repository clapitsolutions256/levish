import Link from "next/link";

export function AboutUs() {
  return (
    <section className="py-16 md:py-20" aria-label="About us">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="eyebrow mb-2">About us</p>
        <h2 className="section-heading">Fashion that feels like home</h2>
        <p className="type-copy mt-5 text-[var(--muted)]">
          Empulse is built around one idea: cozy, always. From Lahore, we bring original clothing, shoes, and everyday layers for women, chosen so they feel good and last.
        </p>
        <p className="type-copy mt-4 text-[var(--muted)]">
          Timeless pieces, seasonal drops, and a store that lets you check your order before you pay. Style should be easy, and it should feel like yours.
        </p>
        <Link href="/about" className="btn-primary mt-8">
          Our story
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
