"use client";

import Link from "next/link";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { navCategories } from "@/data/categories";

type NavItem = { id: string; name: string; href: string };

const items: NavItem[] = [
  { id: "store", name: "Store", href: "/" },
  ...navCategories.map((cat) => ({ id: cat.id, name: cat.name, href: `/${cat.slug}` })),
];

const byId = (ids: string[]) => ids.map((id) => items.find((item) => item.id === id)).filter((item): item is NavItem => Boolean(item));

// Mobile row: [Tops ▾] [Shoes] [Store] [Trouser] [More ▾], with Store in the middle.
const mobileLeftMenu = { key: "left", label: "Tops", align: "left", items: byId(["sweatshirt", "hoodies", "jackets"]) } as const;
const mobileCenter = byId(["shoes", "store", "trouser"]);
const mobileRightMenu = { key: "right", label: "More", align: "right", items: byId(["jeans", "undergarments"]) } as const;

type MenuKey = "left" | "right";

function isActive(href: string, pathname: string, searchParams: URLSearchParams | null) {
  if (href === "/") return pathname === "/";
  const [path, query] = href.split("?");
  if (!query) return pathname === path || pathname.startsWith(`${path}/`);
  if (pathname !== path || !searchParams) return false;
  for (const [key, value] of new URLSearchParams(query)) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

// `[&:hover]` instead of `hover:` so the override also beats the global a:hover on touch screens.
const pillTone = (active: boolean) =>
  active
    ? "bg-[#161616] text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)] [&:hover]:!text-white"
    : "text-[var(--muted)] [&:hover]:!text-[var(--foreground)]";

function DesktopPills({ activeId }: { activeId: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Slide the dark pill under the active link.
  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = () => {
      const el = linkRefs.current[activeId];
      setIndicator(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (row) observer.observe(row);
    return () => observer.disconnect();
  }, [activeId]);

  return (
    <div className="hidden overflow-x-auto rounded-full [scrollbar-width:none] md:block [&::-webkit-scrollbar]:hidden">
      <div ref={rowRef} className="relative w-max">
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 rounded-full bg-[#161616] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-[transform,width,opacity] duration-300 ease-out ${
            indicator ? "opacity-100" : "opacity-0"
          }`}
          style={{ width: indicator?.width ?? 0, transform: `translateX(${indicator?.left ?? 0}px)` }}
        />
        <ul className="flex items-center">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <Link
                  ref={(el) => {
                    linkRefs.current[item.id] = el;
                  }}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative block whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium lg:px-6 lg:py-3 lg:text-[15px] transition-colors duration-300 ${
                    active ? "text-white [&:hover]:!text-white" : "text-[var(--muted)] [&:hover]:!text-[var(--foreground)]"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MobilePills({ activeId }: { activeId: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openMenu]);

  const menuButton = (menu: typeof mobileLeftMenu | typeof mobileRightMenu) => {
    const activeItem = menu.items.find((item) => item.id === activeId);
    const open = openMenu === menu.key;
    return (
      <li className="min-w-0">
        <button
          type="button"
          onClick={() => setOpenMenu(open ? null : menu.key)}
          aria-expanded={open}
          aria-haspopup="true"
          className={`flex w-full items-center justify-center gap-0.5 rounded-full px-2 py-2 text-[12px] font-medium transition-colors duration-300 ${pillTone(Boolean(activeItem))}`}
        >
          <span className="truncate">{activeItem?.name ?? menu.label}</span>
          <svg
            className={`h-2.5 w-2.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </li>
    );
  };

  const openItems = openMenu === "left" ? mobileLeftMenu : openMenu === "right" ? mobileRightMenu : null;

  return (
    <div ref={rootRef} className="relative md:hidden">
      {openItems && (
        <div
          className={`absolute bottom-full mb-3 w-44 rounded-2xl border border-black/5 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(44,40,37,0.14)] backdrop-blur-xl animate-scale-in ${
            openItems.align === "left" ? "left-0 origin-bottom-left" : "right-0 origin-bottom-right"
          }`}
        >
          {openItems.items.map((item) => {
            const active = item.id === activeId;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpenMenu(null)}
                className={`block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#161616] text-white [&:hover]:!text-white"
                    : "text-[var(--foreground)] hover:bg-black/5 [&:hover]:!text-[var(--foreground)]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}

      <ul className="flex items-center justify-between">
        {menuButton(mobileLeftMenu)}
        {mobileCenter.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block truncate rounded-full px-2 py-2 text-center text-[12px] font-medium transition-colors duration-300 ${pillTone(active)}`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
        {menuButton(mobileRightMenu)}
      </ul>
    </div>
  );
}

function NavPills({ searchParams }: { searchParams: URLSearchParams | null }) {
  const pathname = usePathname();
  // Store stays selected on pages that are not one of the listed categories.
  const activeId = items.find((item) => isActive(item.href, pathname, searchParams))?.id ?? "store";
  return (
    <>
      <MobilePills activeId={activeId} />
      <DesktopPills activeId={activeId} />
    </>
  );
}

function NavPillsWithParams() {
  const searchParams = useSearchParams();
  return <NavPills searchParams={searchParams} />;
}

export function FloatingNav() {
  return (
    <nav
      aria-label="Categories"
      // Lift above the WhatsApp button while a mobile dropdown is open.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] [&:has([aria-expanded=true])]:z-[60]"
    >
      <div className="pointer-events-auto w-full max-w-[24rem] rounded-full border border-black/5 bg-white/80 p-1 md:p-1.5 shadow-[0_8px_30px_rgba(44,40,37,0.14)] backdrop-blur-xl md:w-auto md:max-w-full">
        <Suspense fallback={<NavPills searchParams={null} />}>
          <NavPillsWithParams />
        </Suspense>
      </div>
    </nav>
  );
}
