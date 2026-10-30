"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { menNavCategories, navCategories } from "@/data/categories";

type Section = "women" | "men";

const sections: { id: Section; label: string }[] = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
];

function sectionFor(pathname: string): Section | null {
  for (const section of ["women", "men"] as const) {
    if (pathname === `/${section}` || pathname.startsWith(`/${section}/`) || pathname.startsWith(`/shoes/${section}`)) return section;
  }
  return null;
}

function Arrow() {
  return (
    <svg
      className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6l6 6-6 6" />
    </svg>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{children}</p>;
}

// `[&:hover]` instead of `hover:` so the override beats the global a:hover.
const menuLink =
  "group flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[15px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--sage-tint)] [&:hover]:!text-[var(--foreground)]";

const panels: Record<Section, { label: string; title: string; text: string; links: { id: string; name: string; slug: string }[] }> = {
  women: {
    label: "Women",
    title: "The women\u2019s edit",
    text: "Original pieces, from everyday denim to outerwear and shoes.",
    links: navCategories,
  },
  men: {
    label: "Men",
    title: "The men\u2019s edit",
    text: "Sweatshirts, jackets, denim and sneakers from the brands you trust.",
    links: menNavCategories,
  },
};

function GenderPanel({ section, onNavigate }: { section: Section; onNavigate: () => void }) {
  const panel = panels[section];
  const clothing = panel.links.filter((cat) => cat.id !== "shoes");
  const footwear = panel.links.filter((cat) => cat.id === "shoes");
  return (
    <div className="grid grid-cols-[16rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-8">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[var(--accent)] p-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[var(--sage)]/30 blur-2xl" aria-hidden="true" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">{panel.label}</p>
          <p className="mt-3 text-xl font-semibold leading-snug">{panel.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{panel.text}</p>
        </div>
        <Link
          href={`/${section}`}
          onClick={onNavigate}
          className="clay-sage group relative mt-6 inline-flex w-max items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold [&:hover]:!text-[var(--foreground)]"
        >
          Shop all {panel.label.toLowerCase()}
          <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <div className="pt-3">
        <ColumnHeading>Clothing</ColumnHeading>
        <ul className="grid grid-cols-2 gap-x-2">
          {clothing.map((cat) => (
            <li key={cat.id}>
              <Link href={`/${cat.slug}`} onClick={onNavigate} className={menuLink}>
                {cat.name}
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3">
        <ColumnHeading>Footwear</ColumnHeading>
        <ul>
          {footwear.map((cat) => (
            <li key={cat.id}>
              <Link href={`/${cat.slug}`} onClick={onNavigate} className={menuLink}>
                {cat.name}
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3">
        <ColumnHeading>Discover</ColumnHeading>
        <ul>
          <li>
            <Link href={`/${section}?filter=new`} onClick={onNavigate} className={menuLink}>
              New in
              <Arrow />
            </Link>
          </li>
          <li>
            <Link href="/brands" onClick={onNavigate} className={menuLink}>
              Brands
              <Arrow />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Men / Women toggles for the desktop header. Clicking one opens a full-width
 * panel under the header bar, so the nearest positioned ancestor must be the header row.
 */
export function ShopMenu() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<Section, HTMLButtonElement | null>>({ women: null, men: null });
  const [open, setOpen] = useState<Section | null>(null);
  const current = sectionFor(pathname);

  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      buttonRefs.current[open]?.focus();
      setOpen(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(null);
  // The open panel takes the dark pill; otherwise it marks the section you're browsing.
  const highlighted = open ?? current;

  return (
    <div ref={rootRef}>
      <ul className="clay flex items-center rounded-full p-1">
        {sections.map((section) => {
          const active = highlighted === section.id;
          const expanded = open === section.id;
          return (
            <li key={section.id}>
              <button
                ref={(el) => {
                  buttonRefs.current[section.id] = el;
                }}
                type="button"
                onClick={() => setOpen(expanded ? null : section.id)}
                aria-expanded={expanded}
                aria-controls="shop-menu-panel"
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                  active ? "clay-ink" : "text-[var(--foreground)]/80 hover:text-[var(--foreground)]"
                }`}
              >
                {section.label}
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      {open && (
        <div
          id="shop-menu-panel"
          className="glass animate-fade-down absolute inset-x-0 top-full mt-2 rounded-[1.6rem] p-3"
        >
          <GenderPanel section={open} onNavigate={close} />
        </div>
      )}
    </div>
  );
}
