import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "FAQs",
  description: "Answers about Empulse shipping, free delivery, order tracking, returns and sizing in Pakistan.",
  path: "/faqs",
});

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Orders are processed within 1–2 business days. Delivery typically takes 3–7 business days within Pakistan, depending on your location.",
    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
  },
  {
    q: "Do you offer free shipping?",
    a: "Yes. We offer free shipping on all orders above Rs. 5,000. Orders below that amount may incur a nominal delivery charge.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    q: "How can I track my order?",
    a: "Once your order ships, you'll receive an email with a tracking link. You can also track your order from your account or by contacting us.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    q: "What is your return and exchange policy?",
    a: "You can return or exchange most unused items within 14 days of delivery. See our Returns / Exchanges page for full details and steps.",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    q: "How do I choose the right size?",
    a: "Each product page includes a size guide. If you're between sizes, we recommend sizing up for a relaxed fit or sticking to your usual size for a closer fit.",
    icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
  },
  {
    q: "How can I contact customer service?",
    a: "You can reach us via the Contact Us page. We aim to respond within 24–48 hours on business days.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
];

const delayClasses = ["", "animation-delay-100", "animation-delay-200", "animation-delay-300", "animation-delay-400", "animation-delay-500"];

export default function FAQsPage() {
  return (
    <div className="bg-warm-radial">
      <JsonLd data={faqJsonLd(faqs)} />
      {/* Header */}
      <section className="bg-[#f4e6ec] py-16 md:py-20 border-b border-[#e7d0da]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="eyebrow mb-3 animate-fade-down">Help Center</p>
          <h1 className="section-heading animate-fade-up">
            Frequently Asked Questions
          </h1>
          <p className="type-copy mt-4 text-[var(--muted)] animate-fade-up animation-delay-100">
            Can&apos;t find what you need?{" "}
            <Link href="/contact" className="text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors">
              Contact us
            </Link>
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`card-warm p-6 md:p-7 animate-fade-up ${delayClasses[Math.min(i, 5)]}`}
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={faq.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="section-heading mb-2 text-[var(--foreground)]">{faq.q}</h3>
                  <p className="type-copy text-[var(--muted)]">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center animate-fade-up">
          <p className="type-copy mb-5 text-[var(--muted)]">Still have questions?</p>
          <Link href="/contact" className="btn-outline">
            Contact Us
            <svg className="w-4 h-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
