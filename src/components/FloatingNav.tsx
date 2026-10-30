"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { MobileShopSheet, OPEN_SHOP_SHEET } from "@/components/MobileShopSheet";
import type { MenuThumbs } from "@/lib/showcase";

type Tab = "home" | "shop" | "search" | "cart" | "account";

const icons: Record<Tab, string> = {
  home: "M3 10.5L12 3l9 7.5v9a1.5 1.5 0 01-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 013 19.5v-9z",
  shop: "M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z",
  search: "M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM16 16l4.5 4.5",
  cart: "M5 8h14l-1 12H6L5 8zm3 0V6a4 4 0 018 0v2",
  account: "M12 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM5 21a7 7 0 0114 0",
};

const labels: Record<Tab, string> = { home: "Home", shop: "Shop", search: "Search", cart: "Cart", account: "Account" };

function tabFor(pathname: string): Tab {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) return "cart";
  if (["/account", "/login", "/signup", "/forgot-password", "/reset-password"].some((path) => pathname.startsWith(path))) return "account";
  return "shop";
}

function tap() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
}

export function FloatingNav({ thumbs }: { thumbs: MenuThumbs }) {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [badgePop, setBadgePop] = useState(false);
  const active: Tab = sheetOpen ? "shop" : tabFor(pathname);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => setSheetOpen(false), [pathname]);

  // The header's menu button opens the same sheet.
  useEffect(() => {
    const open = () => setSheetOpen(true);
    window.addEventListener(OPEN_SHOP_SHEET, open);
    return () => window.removeEventListener(OPEN_SHOP_SHEET, open);
  }, []);

  useEffect(() => {
    let timer = 0;
    const onPop = () => {
      setBadgePop(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setBadgePop(false), 450);
    };
    window.addEventListener("empulse-cart-pop", onPop);
    return () => {
      window.removeEventListener("empulse-cart-pop", onPop);
      window.clearTimeout(timer);
    };
  }, []);

  const tabClass = (tab: Tab) =>
    `relative flex h-12 items-center justify-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
      active === tab ? "text-white [&:hover]:!text-white" : "text-[var(--foreground)]/70 [&:hover]:!text-[var(--foreground)]"
    }`;

  const body = (tab: Tab) => (
    <>
      {active === tab ? (
        <motion.span layoutId="dock-active" className="clay-ink absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 460, damping: 36 }} aria-hidden="true" />
      ) : null}
      <span className={`relative ${tab === "cart" && badgePop ? "cart-pop" : ""}`}>
        <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={icons[tab]} />
        </svg>
        {tab === "cart" && itemCount > 0 ? (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sage)] px-1 text-[10px] font-bold text-[var(--accent)] ring-2 ring-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </span>
      {active === tab ? (
        <motion.span className="relative" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2 }}>
          {labels[tab]}
        </motion.span>
      ) : null}
    </>
  );

  return (
    <>
      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:hidden">
        <motion.ul layout className="glass-solid flex h-16 items-center justify-between rounded-full px-2">
          <li>
            <Link href="/" onClick={tap} aria-label="Home" aria-current={active === "home" ? "page" : undefined} className={tabClass("home")}>
              {body("home")}
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                tap();
                setSheetOpen((open) => !open);
              }}
              aria-label="Shop"
              aria-expanded={sheetOpen}
              className={tabClass("shop")}
            >
              {body("shop")}
            </button>
          </li>
          <li>
            <Link href="/search" onClick={tap} aria-label="Search" className={tabClass("search")}>
              {body("search")}
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                tap();
                openCart();
              }}
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className={tabClass("cart")}
            >
              {body("cart")}
            </button>
          </li>
          <li>
            <Link href="/account" onClick={tap} aria-label="Account" className={tabClass("account")}>
              {body("account")}
            </Link>
          </li>
        </motion.ul>
      </nav>
      <MobileShopSheet open={sheetOpen} onClose={closeSheet} thumbs={thumbs} initial={pathname.startsWith("/men") ? "men" : "women"} />
    </>
  );
}
