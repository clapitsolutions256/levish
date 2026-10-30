"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { menNavCategories, navCategories, type Gender } from "@/data/categories";
import type { MenuThumbs } from "@/lib/showcase";

export const OPEN_SHOP_SHEET = "empulse-open-shop";

const sections: { id: Gender; label: string; title: string; links: { id: string; name: string; slug: string }[] }[] = [
  { id: "women", label: "Women", title: "The women’s edit", links: navCategories },
  { id: "men", label: "Men", title: "The men’s edit", links: menNavCategories },
];

const helpLinks = [
  { name: "About", href: "/about" },
  { name: "FAQs", href: "/faqs" },
  { name: "Returns", href: "/returns" },
  { name: "Contact", href: "/contact" },
  { name: "Blogs", href: "/blog" },
  { name: "Privacy", href: "/privacy" },
];

/** Phone shop menu: a bottom sheet with Women / Men tabs and photo cards for every category. */
export function MobileShopSheet({
  open,
  onClose,
  thumbs,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  thumbs: MenuThumbs;
  initial: Gender;
}) {
  const still = useReducedMotion();
  const drag = useDragControls();
  const [section, setSection] = useState<Gender>(initial);

  useEffect(() => {
    if (open) setSection(initial);
  }, [open, initial]);

  // Keep the page still behind the sheet and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const current = sections.find((item) => item.id === section) ?? sections[0];
  // Only categories with something in stock; a photo is found for each of those.
  const links = current.links.filter((link) => thumbs[current.id][link.id]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70] md:hidden">
          <motion.div
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Shop menu"
            className="glass-solid absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-[2rem] pb-[env(safe-area-inset-bottom)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={still ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="touch-none px-5 pb-3 pt-3" onPointerDown={(event) => drag.start(event)}>
              <div className="mx-auto h-1.5 w-12 rounded-full bg-black/15" aria-hidden="true" />
              <div className="mt-3 flex items-center justify-between">
                <p className="font-display text-3xl italic leading-none">Shop</p>
                <button type="button" onClick={onClose} className="clay flex h-10 w-10 items-center justify-center rounded-full" aria-label="Close menu">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="clay mt-4 grid grid-cols-2 rounded-full p-1" role="tablist" aria-label="Section">
                {sections.map((item) => {
                  const selected = item.id === section;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setSection(item.id)}
                      className={`relative rounded-full py-2.5 text-sm font-semibold transition-colors ${selected ? "text-white" : "text-[var(--foreground)]/70"}`}
                    >
                      {selected ? (
                        <motion.span layoutId="sheet-tab" className="clay-ink absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" />
                      ) : null}
                      <span className="relative">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-y-auto overscroll-contain px-5 pb-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: current.id === "men" ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: current.id === "men" ? -24 : 24 }}
                  transition={{ duration: still ? 0 : 0.22 }}
                >
                  <Link
                    href={`/${current.id}`}
                    onClick={onClose}
                    className="relative flex h-28 items-end overflow-hidden rounded-[1.5rem] bg-[var(--accent)] p-4 text-white [&:hover]:!text-white"
                  >
                    {thumbs[current.id].all ? (
                      <Image src={thumbs[current.id].all} alt="" fill sizes="90vw" className="object-cover opacity-45" />
                    ) : null}
                    <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--sage)]/40 blur-2xl" aria-hidden="true" />
                    <span className="relative">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">{current.label}</span>
                      <span className="font-display block text-2xl italic leading-tight">{current.title}</span>
                    </span>
                    <span className="clay-sage relative ml-auto rounded-full px-3 py-1.5 text-xs font-semibold">Shop all</span>
                  </Link>

                  <ul className="mt-3 grid grid-cols-2 gap-3">
                    {links.map((link, index) => (
                      <motion.li
                        key={link.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: still ? 0 : 0.04 * index, duration: still ? 0 : 0.3 }}
                      >
                        <Link
                          href={`/${link.slug}`}
                          onClick={onClose}
                          className="clay relative flex h-32 flex-col justify-end overflow-hidden rounded-[1.4rem] p-3 [&:hover]:!text-[var(--foreground)]"
                        >
                          <Image src={thumbs[current.id][link.id]} alt="" fill sizes="45vw" className="object-cover" />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" aria-hidden="true" />
                          <span className="relative text-sm font-semibold text-white">{link.name}</span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  { label: "New in", href: `/${section}?filter=new` },
                  { label: "Search", href: "/search" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={onClose} className="skeuo rounded-2xl py-3 text-center text-xs font-semibold [&:hover]:!text-[var(--foreground)]">
                    {item.label}
                  </Link>
                ))}
              </div>

              <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Help</p>
              <div className="flex flex-wrap gap-2">
                {helpLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={onClose} className="rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[var(--foreground)]/80 [&:hover]:!text-[var(--foreground)]">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
