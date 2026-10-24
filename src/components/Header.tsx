"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { assets } from "@/data/assets";
import { OfferTicker } from "@/components/OfferTicker";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { clearCustomerSession, readCustomerSession, type CustomerSession } from "@/lib/customerSession";

const helpLinks = [
  { name: "Blogs", href: "/blog" },
  { name: "About Us", href: "/about" },
  { name: "FAQs", href: "/faqs" },
  { name: "Returns / Exchanges", href: "/returns" },
  { name: "Contact Us", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
];

const iconButton =
  "p-2.5 rounded-full bg-white/70 text-[var(--foreground)] backdrop-blur-md transition-colors duration-200 hover:bg-white hover:text-[#4a142a]";

export function Header() {
  const { itemCount, openCart } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState({ top: 0, right: 12 });
  const [cartPop, setCartPop] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  // On the home page the header floats over the full-screen banner.
  const overlay = usePathname() === "/";
  const [customer, setCustomer] = useState<CustomerSession | null>(null);

  useEffect(() => {
    const sync = () => setCustomer(readCustomerSession());
    sync();
    window.addEventListener("empulse-customer", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("empulse-customer", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Expose the header height so content can clear it while the header is overlaid.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let timer = 0;
    const onPop = () => {
      setCartPop(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCartPop(false), 400);
    };
    window.addEventListener("empulse-cart-pop", onPop);
    return () => {
      window.removeEventListener("empulse-cart-pop", onPop);
      window.clearTimeout(timer);
    };
  }, []);

  const openProfile = (button: HTMLElement | null) => {
    const rect = button?.getBoundingClientRect();
    if (rect) {
      setProfileAnchor({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    }
    setHelpMenuOpen(false);
    setProfileOpen((open) => !open);
  };

  return (
    <header ref={headerRef} className={`${overlay ? "fixed inset-x-0" : "sticky"} top-0 z-50`}>
      <OfferTicker />
      {/* Stays transparent while scrolling; the icon backdrops keep the controls readable. */}
      <div className="relative z-50">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-4 md:h-[72px] md:px-6">
          <div className="flex items-center justify-self-start">
            <Link href="/search" className={`${iconButton}`} aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center rounded-xl px-2 py-1 transition-transform duration-300 hover:scale-[1.02]"
            aria-label="Levish home"
          >
            <Image
              src={assets.logo}
              alt="Levish"
              width={1595}
              height={541}
              className="h-10 w-auto object-contain md:h-12"
              priority
              unoptimized
            />
          </Link>

          <div className="flex items-center justify-self-end gap-0.5">
            <button
              type="button"
              onClick={(event) => openProfile(event.currentTarget)}
              className={`${iconButton}`}
              aria-label="Account"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
              type="button"
              className={`relative ${iconButton} ${cartPop ? "cart-pop" : ""}`}
              onClick={openCart}
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      {profileOpen && (
        <div>
          <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => { setProfileOpen(false); setHelpMenuOpen(false); }} />
          <div
            className="fixed z-[70] w-56 py-2 bg-white text-[var(--foreground)] border border-[var(--border)] rounded-xl shadow-lg shadow-[var(--shadow-warm)]"
            style={{ top: profileAnchor.top, right: profileAnchor.right }}
          >
            {customer ? (
              <>
                <Link
                  href="/account"
                  className="mx-1 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[#f4e6ec] hover:text-[#4a142a]"
                  onClick={() => { setProfileOpen(false); setHelpMenuOpen(false); }}
                >
                  Profile
                </Link>
                <p className="px-4 pb-1 text-xs text-[var(--muted)]">{customer.name}</p>
                <button
                  type="button"
                  className="mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[#f4e6ec]"
                  onClick={() => {
                    clearCustomerSession();
                    setProfileOpen(false);
                    setHelpMenuOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="mx-1 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[#f4e6ec] hover:text-[#4a142a]"
                  onClick={() => { setProfileOpen(false); setHelpMenuOpen(false); }}
                >
                  <svg className="h-4 w-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="mx-1 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[#f4e6ec] hover:text-[#4a142a]"
                  onClick={() => { setProfileOpen(false); setHelpMenuOpen(false); }}
                >
                  <svg className="h-4 w-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign up
                </Link>
              </>
            )}
            <div className="mx-3 my-2 border-t border-[var(--border)]" />
            <div className="relative">
              <button
                type="button"
                className="mx-1 flex w-[calc(100%-0.5rem)] items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[#f4e6ec] hover:text-[#4a142a]"
                aria-expanded={helpMenuOpen}
                onClick={() => setHelpMenuOpen((open) => !open)}
              >
                Help
                <svg className={`h-4 w-4 text-[#4a142a] transition-transform duration-200 ${helpMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {helpMenuOpen && (
                <div className="mx-2 mt-1 rounded-lg bg-[#f4e6ec] py-1 md:absolute md:right-full md:top-0 md:z-[80] md:mx-0 md:mr-2 md:mt-0 md:w-56 md:rounded-xl md:border md:border-[var(--border)] md:bg-white md:py-2 md:shadow-lg md:shadow-[var(--shadow-warm)]">
                  {helpLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="mx-1 flex items-center rounded-lg px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-white hover:text-[#4a142a] md:hover:bg-[#f4e6ec]"
                      onClick={() => { setProfileOpen(false); setHelpMenuOpen(false); }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
