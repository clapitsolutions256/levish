import Link from "next/link";
import Image from "next/image";
import { assets } from "@/data/assets";
import { contact } from "@/data/contact";

const footerLinks = {
  shop: [
    { label: "Women", href: "/women" },
    { label: "Shoes", href: "/shoes" },
    { label: "Accessories", href: "/accessories" },
  ],
  help: [
    { label: "Blogs", href: "/blog" },
    { label: "About Us", href: "/about" },
    { label: "FAQs", href: "/faqs" },
    { label: "Returns / Exchanges", href: "/returns" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-[var(--cream)] mt-0 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[var(--accent)]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[var(--accent-soft)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 animate-fade-up">
            <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105">
              <Image
                src={assets.logo}
                alt="Levish"
                width={1595}
                height={541}
                className="h-14 w-auto object-contain brightness-0 invert"
                unoptimized
              />
            </Link>
            <p className="type-copy mt-5 max-w-xs text-[var(--cream)]/70">
              Quality clothing, shoes and accessories crafted with care for
              women.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--cream)]/80">
              <li>
                <a href={`mailto:${contact.email}`} className="hover:!text-white transition-colors">
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:!text-white transition-colors">
                  WhatsApp {contact.whatsapp}
                </a>
              </li>
            </ul>
            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#4a142a]/20 flex items-center justify-center text-[#4a142a] hover:bg-[#f4e6ec] transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#4a142a]/20 flex items-center justify-center text-[#4a142a] hover:bg-[#f4e6ec] transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#4a142a]/20 flex items-center justify-center text-[#4a142a] hover:bg-[#f4e6ec] transition-all duration-200"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="md:col-span-3 md:col-start-7 animate-fade-up animation-delay-100">
            <h4 className="font-semibold text-xs uppercase tracking-[0.2em] text-[var(--accent-soft)] mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--cream)]/70 hover:!text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div className="md:col-span-3 animate-fade-up animation-delay-200">
            <h4 className="font-semibold text-xs uppercase tracking-[0.2em] text-[var(--accent-soft)] mb-5">
              Help
            </h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--cream)]/70 hover:!text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-up animation-delay-300">
          <div className="text-center sm:text-left">
            <p className="text-xs text-[var(--muted)]">
              &copy; {new Date().getFullYear()} Empulse. All rights reserved.
            </p>
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Powered by{" "}
              <a
                href="https://www.clapit.solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--cream)]/80 hover:!text-white transition-colors"
              >
                Clapit Solutions
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--muted)]">
            <Link href="/privacy" className="hover:!text-white transition-colors">Privacy</Link>
            <Link href="/returns" className="hover:!text-white transition-colors">Returns</Link>
            <Link href="/faqs" className="hover:!text-white transition-colors">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
