import type { Metadata } from "next";
import { contact } from "@/data/contact";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact Us",
  description: "Contact Empulse by email or WhatsApp for orders, shipping and returns. We reply within 1–2 business days.",
  path: "/contact",
});

const channels = [
  {
    title: "Email",
    text: contact.email,
    href: `mailto:${contact.email}`,
    icon: "email" as const,
  },
  {
    title: "WhatsApp",
    text: contact.whatsapp,
    href: contact.whatsappHref,
    icon: "whatsapp" as const,
  },
  {
    title: "Facebook",
    text: "Empulse",
    href: contact.facebook,
    icon: "facebook" as const,
  },
  {
    title: "Instagram",
    text: "@empulse.store",
    href: contact.instagram,
    icon: "instagram" as const,
  },
  {
    title: "Location",
    text: "Lahore, Pakistan",
    href: "",
    icon: "location" as const,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-warm-radial">
      <section className="border-b border-[#e7d0da] bg-[#f4e6ec] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="eyebrow mb-3 animate-fade-down">Get in Touch</p>
          <h1 className="section-heading animate-fade-up">Contact Us</h1>
          <p className="type-copy mx-auto mt-4 max-w-lg text-[var(--muted)] animate-fade-up animation-delay-100">
            Have a question, feedback or need help with an order? We&apos;re here for you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((item) => {
            const card = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4e6ec] text-[#4a142a]">
                  <ChannelIcon name={item.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#4a142a]">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--foreground)]">{item.text}</span>
                </span>
              </>
            );
            const className =
              "card-warm flex items-center gap-4 p-4 transition-colors hover:border-[#4a142a]/25";
            return item.href ? (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={className}
              >
                {card}
              </a>
            ) : (
              <div key={item.title} className={className}>
                {card}
              </div>
            );
          })}
        </div>

        <form className="card-warm mx-auto mt-8 max-w-3xl space-y-5 p-6 sm:p-8" action="#" method="post">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Send a message</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">We reply within 24–48 hours on business days.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Name
              </label>
              <input id="name" name="name" type="text" required className="input-warm" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input id="email" name="email" type="email" required className="input-warm" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Subject
            </label>
            <select id="subject" name="subject" className="input-warm">
              <option value="order">Order / Shipping</option>
              <option value="return">Returns / Exchanges</option>
              <option value="product">Product Question</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="input-warm resize-y"
              placeholder="How can we help?"
            />
          </div>
          <button type="submit" className="btn-primary">
            Send Message
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function ChannelIcon({ name }: { name: "email" | "whatsapp" | "facebook" | "instagram" | "location" }) {
  if (name === "email") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (name === "whatsapp") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" strokeWidth={1.6} />
    </svg>
  );
}
