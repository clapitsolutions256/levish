"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminBackgrounds } from "@/data/adminBackgrounds";

const icon = (d: string) => (
  <svg className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={d} />
  </svg>
);

const nav = [
  { label: "Overview", href: "/admin", icon: icon("M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10") },
  { label: "Products", href: "/admin/products", icon: icon("M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4") },
  { label: "Banners", href: "/admin/banners", icon: icon("M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9.5a1 1 0 100-2 1 1 0 000 2") },
  { label: "Orders", href: "/admin/orders", icon: icon("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2") },
  { label: "Customers", href: "/admin/customers", icon: icon("M17 20h5v-2a3 3 0 00-5.36-1.86M17 20H7m10 0v-2c0-.66-.13-1.29-.36-1.86M7 20H2v-2a3 3 0 015.36-1.86M7 20v-2c0-.66.13-1.29.36-1.86m0 0a5 5 0 019.28 0M15 7a3 3 0 11-6 0 3 3 0 016 0z") },
  { label: "Analytics", href: "/admin/analytics", icon: icon("M4 19V9m6 10V5m6 14v-7m4 7H2") },
];

function isActive(href: string, pathname: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function RailButton({ label, onClick, href, children }: { label: string; onClick?: () => void; href?: string; children: React.ReactNode }) {
  const className =
    "group relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)]/75 transition-colors hover:bg-white/70 hover:text-[var(--foreground)]";
  const tip = (
    <span className="glass-solid pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
      {label}
    </span>
  );
  return href ? (
    <Link href={href} target="_blank" className={className} aria-label={label}>
      {children}
      {tip}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {children}
      {tip}
    </button>
  );
}

/** Top bar, left rail and bottom dock that frame every admin page, as in a glass OS. */
export function AdminChrome({ background, onBackground }: { background: string; onBackground: (id: string) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hello, setHello] = useState("Welcome");
  const pickerRef = useRef<HTMLDivElement>(null);
  const current = nav.find((item) => isActive(item.href, pathname));

  // The greeting depends on the viewer's clock, so it is set after hydration.
  useEffect(() => setHello(greeting()), []);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setPickerOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPickerOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  const signOut = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <>
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 lg:px-6">
        <div className="glass flex items-center justify-between gap-4 rounded-full py-2 pl-2 pr-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="clay-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                {hello}, {admin?.name?.split(" ")[0] || "Admin"}
              </p>
              <p className="truncate text-xs text-[var(--foreground)]/60">{admin?.email || "Levish admin"}</p>
            </div>
          </div>

          <div className="glass-solid hidden items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--foreground)]/80 md:flex">
            <span className="h-2 w-2 rounded-full bg-[var(--sage)] shadow-[0_0_0_3px_rgba(166,205,171,0.35)]" aria-hidden="true" />
            {current?.label ?? "Admin"} · Store is live
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="clay hidden items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[var(--foreground)] sm:flex [&:hover]:!text-[var(--foreground)]"
            >
              View store
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Link>
            <button type="button" onClick={signOut} className="skeuo-ink flex h-10 w-10 items-center justify-center rounded-full" aria-label="Sign out" title="Sign out">
              {icon("M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1")}
            </button>
          </div>
        </div>
      </header>

      {/* Left rail */}
      <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:left-6 lg:block">
        <div ref={pickerRef} className="glass relative flex flex-col items-center gap-1 rounded-full p-1.5">
          <RailButton label="Change background" onClick={() => setPickerOpen((open) => !open)}>
            {icon("M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z")}
          </RailButton>
          <RailButton label="Open the store" href="/">
            {icon("M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6")}
          </RailButton>

          {pickerOpen && (
            <div className="glass-solid animate-scale-in absolute left-full top-0 ml-3 w-[19rem] origin-left rounded-3xl p-3">
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Background</p>
              <div className="grid grid-cols-2 gap-2">
                {adminBackgrounds.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onBackground(item.id)}
                    aria-pressed={item.id === background}
                    className={`group relative aspect-[16/10] overflow-hidden rounded-2xl ring-2 transition ${
                      item.id === background ? "ring-[var(--accent)]" : "ring-transparent hover:ring-white"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumb} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-full bg-black/45 px-2 py-0.5 text-left text-[10px] font-medium text-white backdrop-blur-sm">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom dock */}
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <ul className="glass flex max-w-full items-center gap-1 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.href} className="relative">
                {active && (
                  <motion.span
                    layoutId="admin-dock-active"
                    className="clay-ink absolute inset-0 rounded-full"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                  />
                )}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                    active ? "text-white [&:hover]:!text-white" : "text-[var(--foreground)]/75 [&:hover]:!text-[var(--foreground)]"
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
