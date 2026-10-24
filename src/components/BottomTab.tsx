"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { readCustomerSession } from "@/lib/customerSession";

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/cart", label: "Cart", icon: CartIcon },
  { href: "/account", label: "Account", icon: AccountIcon },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export function BottomTab() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const sync = () => setSignedIn(Boolean(readCustomerSession()));
    sync();
    window.addEventListener("empulse-customer", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("empulse-customer", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--card)]/95 backdrop-blur-xl border-t border-[var(--border)]/60 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const href = tab.href === "/account" && !signedIn ? "/login" : tab.href;
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isCart = tab.href === "/cart";
          return (
            <Link
              key={tab.label}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 px-2 text-[#4a142a] transition-colors duration-200"
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
            >
              <span className="relative inline-flex">
                <tab.icon active={active} />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[var(--card)]">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </span>
              <span className={`text-[10px] truncate w-full text-center ${active ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
