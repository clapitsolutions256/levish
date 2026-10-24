"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { navCategories } from "@/data/categories";
import { assets } from "@/data/assets";
import { useEffect, useRef, useState } from "react";
import { clearCustomerSession, readCustomerSession, type CustomerSession } from "@/lib/customerSession";

const helpLinks = [
  { name: "Blogs", href: "/blog" },
  { name: "About Us", href: "/about" },
  { name: "FAQs", href: "/faqs" },
  { name: "Returns / Exchanges", href: "/returns" },
  { name: "Contact Us", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
];

export function Header() {
  const { itemCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNavId, setOpenNavId] = useState<string | null>(null);
  const [openMobileSubId, setOpenMobileSubId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState({ top: 0, right: 12 });
  const [cartPop, setCartPop] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const itemHover = scrolled
    ? "text-white/85 hover:!text-white hover:bg-white/10"
    : "text-[var(--foreground)] hover:!text-[#4a142a] hover:bg-[#f4e6ec]";
  const iconHover = scrolled
    ? "text-[#4a142a] bg-white hover:bg-white"
    : "text-[#4a142a] hover:bg-[#4a142a]/10";

  const openProfile = (button: HTMLElement | null) => {
    const rect = button?.getBoundingClientRect();
    if (rect) {
      setProfileAnchor({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    }
    setMenuOpen(false);
    setHelpMenuOpen(false);
    setProfileOpen((open) => !open);
  };

  return (
    <header className="sticky top-0 z-50">
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm min-[1100px]:hidden"
          aria-hidden
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="relative z-50 bg-[#161616] text-white">
        <p className="mx-auto hidden h-9 max-w-7xl items-center justify-center gap-x-2.5 px-6 text-[11px] font-medium uppercase tracking-[0.16em] md:flex">
          <span>Free shipping across Pakistan</span>
          <span className="text-[#c989a3]" aria-hidden="true">•</span>
          <span>7 days return</span>
          <span className="text-[#c989a3]" aria-hidden="true">•</span>
          <span>First check then pay</span>
        </p>
        <div className="overflow-hidden md:hidden">
        <div className="ticker-scroll-ltr flex w-max py-2">
          {[0, 1].map((copy) => (
            <p
              key={copy}
              className="flex items-center px-4 text-[11px] font-medium uppercase tracking-[0.16em] whitespace-nowrap"
            >
              <span>Free shipping across Pakistan</span>
              <span className="mx-2.5 text-[#c989a3]" aria-hidden="true">•</span>
              <span>7 days return</span>
              <span className="mx-2.5 text-[#c989a3]" aria-hidden="true">•</span>
              <span>First check then pay</span>
              <span className="mx-2.5 text-[#c989a3]" aria-hidden="true">•</span>
            </p>
          ))}
        </div>
        </div>
      </div>
      <div className="relative z-50 px-3 sm:px-4 md:px-6 pt-3 md:pt-4">
      <div
        className={`overflow-hidden rounded-2xl transition-colors duration-300 md:overflow-visible ${
          scrolled
            ? "bg-black/40 text-white backdrop-blur-md border border-white/15"
            : "bg-white text-[var(--foreground)] shadow-[0_8px_30px_rgba(44,40,37,0.08)] border border-[var(--border)]"
        }`}
      >
        <div className="relative grid h-[64px] grid-cols-[auto_1fr_auto] items-center gap-3 px-3 md:h-[72px] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-5">
          {/* Mobile hamburger */}
          <button
            type="button"
            className={`min-[1100px]:hidden p-2 -ml-1 rounded-lg transition-colors ${iconHover}`}
            onClick={() => {
              setProfileOpen(false);
              setMenuOpen((o) => !o);
            }}
            aria-label="Menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop nav */}
          <nav className="@container hidden min-w-0 items-center min-[1100px]:flex">
            {navCategories.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setOpenNavId(cat.id)}
                onMouseLeave={() => setOpenNavId(null)}
              >
                <Link
                  href={`/${cat.slug}`}
                  className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-lg px-1 py-2 text-[12px] font-medium transition-all duration-200 @[460px]:px-1.5 @[460px]:text-[13px] @[560px]:gap-1 @[560px]:px-2.5 @[560px]:text-[14px] ${itemHover}`}
                >
                  {cat.name}
                  {cat.children.length > 0 && (
                    <svg className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
                {openNavId === cat.id && cat.children.length > 0 && (
                  <div className="absolute left-0 top-full z-50 pt-2 animate-scale-in">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg shadow-[var(--shadow-warm)] py-2 min-w-[220px]">
                      {cat.children.map((child) => (
                        <Link
                          key={child.slug}
                          href={`/${child.slug}`}
                          className="flex items-center px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[#f4e6ec] hover:text-[#4a142a] transition-colors rounded-lg mx-1"
                          onClick={() => setOpenNavId(null)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <Link
            href="/"
            className="z-10 flex items-center justify-self-center rounded-xl px-2.5 py-1.5 transition-all duration-300 hover:scale-[1.02] md:px-3"
            aria-label="Levish home"
          >
            <Image
              src={assets.logo}
              alt="Levish"
              width={1595}
              height={541}
              className={`h-11 w-auto object-contain md:h-14 ${scrolled ? "brightness-0 invert" : ""}`}
              priority
              unoptimized
            />
          </Link>

          {/* Desktop actions */}
          <div className="col-start-3 hidden items-center justify-self-end gap-1 md:flex">
            <button
              type="button"
              onClick={(event) => openProfile(event.currentTarget)}
              className={`p-2.5 rounded-xl transition-colors duration-200 ${iconHover}`}
              aria-label="Account"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <Link
              href="/search"
              className={`p-2.5 rounded-xl transition-colors duration-200 ${iconHover}`}
              aria-label="Search"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button
              type="button"
              className={`relative p-2.5 rounded-xl transition-colors duration-200 ${iconHover} ${cartPop ? "cart-pop" : ""}`}
              onClick={openCart}
              aria-label="Cart"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold flex items-center justify-center ring-2 ${scrolled ? "ring-transparent" : "ring-white"}`}>
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
            <Link
              href="/women"
              className="ml-1 inline-flex items-center px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] hover:!text-white transition-colors"
            >
              Shop now
            </Link>
          </div>

          {/* Mobile profile */}
          <div className="md:hidden">
            <button
              ref={profileButtonRef}
              type="button"
              onClick={() => openProfile(profileButtonRef.current)}
              className={`p-2 rounded-lg transition-colors duration-200 ${iconHover}`}
              aria-label="Account"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
            <div className={`relative z-50 min-[1100px]:hidden max-h-[70vh] overflow-y-auto border-t animate-fade-down ${scrolled ? "border-white/10 bg-black/75 backdrop-blur-md" : "border-[var(--border)] bg-white"}`}>
              <nav className="py-3 px-4 space-y-0.5">
                {navCategories.map((cat) => {
                  const isSubOpen = openMobileSubId === cat.id;
                  const hasChildren = cat.children.length > 0;
                  return (
                    <div key={cat.id}>
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setOpenMobileSubId((id) => (id === cat.id ? null : cat.id))}
                            className={`flex items-center justify-between w-full py-3 px-2 font-medium text-left rounded-lg transition-colors ${itemHover}`}
                            aria-expanded={isSubOpen}
                          >
                            {cat.name}
                            <svg
                              className={`w-4 h-4 text-[#4a142a] transition-transform duration-200 ${isSubOpen ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isSubOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                            <div className="overflow-hidden">
                              <div className="pl-4 space-y-0.5 pt-1 pb-2">
                                {cat.children.map((child) => (
                                  <Link
                                    key={child.slug}
                                    href={`/${child.slug}`}
                                    className={`block py-2 px-3 text-sm rounded-lg transition-colors ${itemHover}`}
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Link
                          href={`/${cat.slug}`}
                          className={`block py-3 px-2 font-medium rounded-lg transition-colors ${itemHover}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
        )}
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
