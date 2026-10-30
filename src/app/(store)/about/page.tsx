import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { assets } from "@/data/assets";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About Us",
  description:
    "Levish is a Pakistan fashion store for clothing, shoes and accessories. Read our story and how we choose original brands.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="bg-warm-radial">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-[var(--sage-tint)] py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--accent)]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="eyebrow mb-4 animate-fade-down">Our Story</p>
          <h1 className="section-heading animate-fade-up">
            About Levish
          </h1>
          <p className="type-copy mt-5 max-w-xl mx-auto text-[var(--muted)] animate-fade-up animation-delay-100">
            Built around one idea: cozy, always. We believe everyone
            deserves quality clothing that feels good and lasts.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        {/* Mission cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 animate-fade-up animation-delay-200">
          <div className="card-warm p-8">
            <div className="w-12 h-12 rounded-full bg-[var(--cream)] flex items-center justify-center mb-5">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="section-heading mb-3">Our Mission</h3>
            <p className="type-copy text-[var(--muted)]">
              Quality clothing, shoes and accessories for women.
              We focus on timeless pieces and seasonal drops so you can dress
              for the moment without the clutter.
            </p>
          </div>
          <div className="card-warm p-8">
            <div className="w-12 h-12 rounded-full bg-[var(--cream)] flex items-center justify-center mb-5">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="section-heading mb-3">Our Promise</h3>
            <p className="type-copy text-[var(--muted)]">
              Free shipping on orders above Rs. 5,000 is our way of making
              quality fashion a little more accessible. Easy returns within
              14 days, no questions asked.
            </p>
          </div>
        </div>

        {/* CEO section */}
        <section className="card-warm p-8 md:p-10 animate-fade-up">
          <p className="eyebrow mb-6">Leadership</p>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="relative w-full sm:w-52 aspect-square rounded-2xl overflow-hidden bg-[var(--cream)] shrink-0 shadow-md shadow-[var(--shadow-warm)]">
              <Image
                src={assets.ceo}
                alt="Syed Mudasir Hussain Shah – CEO, Levish"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 208px"
                preload
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="section-heading text-[var(--foreground)]">
                Syed Mudasir Hussain Shah
              </h3>
              <p className="eyebrow mt-2">Chief Executive Officer</p>
              <p className="type-copy mt-5 text-[var(--muted)]">
                Syed Mudasir Hussain Shah leads Levish from Lahore, bringing a clear
                vision for accessible, quality fashion. Levish has grown around the
                idea of cozy, always — offering thoughtful, original clothing, shoes
                and accessories for men and women.
              </p>
              <p className="type-copy mt-3 text-[var(--muted)]">
                From Lahore to the rest of Pakistan, the focus is on making everyday
                style easy and enjoyable for everyone.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-center animate-fade-up">
          <p className="type-copy mb-6 text-[var(--muted)]">
            Thank you for being here. We&apos;d love to hear from you.
          </p>
          <Link href="/contact" className="btn-primary">
            Contact Us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
