import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description: "How Empulse collects, uses and protects your personal information when you shop or create an account.",
  path: "/privacy",
});

const sections = [
  {
    title: "Information we collect",
    text: "We collect information you provide when you place an order, create an account, subscribe to our newsletter or contact us. This may include your name, email address, shipping address, phone number and payment details. We also collect technical data such as IP address and browser type when you use our website.",
  },
  {
    title: "How we use your information",
    text: "We use your information to process orders, send order updates, respond to enquiries and improve our services. With your consent, we may send you marketing emails about new arrivals and offers. You can unsubscribe at any time.",
  },
  {
    title: "Sharing and disclosure",
    text: "We do not sell your personal data. We may share your information with service providers who help us run our business (e.g. payment processors, delivery partners) under strict confidentiality. We may also disclose information where required by law.",
  },
  {
    title: "Security",
    text: "We use appropriate technical and organisational measures to protect your personal data against unauthorised access, loss or misuse. Payment information is handled by secure, compliant payment providers.",
  },
  {
    title: "Your rights",
    text: "You have the right to access, correct or delete your personal data, and to object to or restrict certain processing. You can also withdraw consent for marketing at any time. To exercise these rights or ask questions about this policy, contact us via the Contact Us page.",
  },
  {
    title: "Changes",
    text: 'We may update this privacy policy from time to time. The "Last updated" date at the top will reflect the latest version. We encourage you to review this page periodically.',
  },
];

const delayClasses = ["", "animation-delay-100", "animation-delay-200", "animation-delay-300", "animation-delay-400", "animation-delay-500"];

export default function PrivacyPage() {
  return (
    <div className="bg-warm-radial">
      {/* Header */}
      <section className="bg-[#f4e6ec] py-16 md:py-20 border-b border-[#e7d0da]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="eyebrow mb-3 animate-fade-down">Legal</p>
          <h1 className="section-heading animate-fade-up">
            Privacy Policy
          </h1>
          <p className="type-copy mt-4 text-[var(--muted)] animate-fade-up animation-delay-100">
            Last updated: February 2025. We respect your privacy and are committed
            to protecting your personal data.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className={`card-warm p-6 md:p-8 animate-fade-up ${delayClasses[Math.min(i, 5)]}`}
            >
              <h2 className="section-heading mb-3 text-[var(--foreground)]">
                {section.title}
              </h2>
              <p className="type-copy text-[var(--muted)]">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
