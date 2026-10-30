"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminAuthGuard } from "./AuthGuard";
import { AdminChrome } from "./AdminChrome";
import { adminBackgrounds, DEFAULT_ADMIN_BACKGROUND } from "@/data/adminBackgrounds";
import { ADMIN_PAUSED, PAUSED_NOTICE } from "@/lib/storeStatus";

const BACKGROUND_KEY = "empulse-admin-background";

function AdminPausedNotice() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <ellipse cx="12" cy="6" rx="7" ry="3" strokeWidth={1.8} />
            <path strokeWidth={1.8} d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
          </svg>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">{PAUSED_NOTICE.label}</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{PAUSED_NOTICE.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{PAUSED_NOTICE.text}</p>
      </div>
    </div>
  );
}

// Full-screen scenery behind the glass. The chosen photo is a per-browser preference.
function useAdminBackground() {
  const [id, setId] = useState(DEFAULT_ADMIN_BACKGROUND);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(BACKGROUND_KEY);
      if (saved && adminBackgrounds.some((item) => item.id === saved)) setId(saved);
    } catch {
      // Storage can be blocked; the default photo is fine.
    }
  }, []);
  const choose = (next: string) => {
    setId(next);
    try {
      window.localStorage.setItem(BACKGROUND_KEY, next);
    } catch {
      // Not saved, but still applied for this visit.
    }
  };
  return [adminBackgrounds.find((item) => item.id === id) ?? adminBackgrounds[0], choose] as const;
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [background, setBackground] = useAdminBackground();

  return (
    <AdminAuthProvider>
      <div className="admin-glass relative isolate min-h-screen" data-tone={background.tone}>
        <div className="fixed inset-0 -z-10 bg-[#cfd8d2]" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={background.id} src={background.photo} alt="" className="animate-fade-in h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />
        </div>
        <AdminAuthGuard>
          {isLoginPage ? (
            children
          ) : (
            <>
              <AdminChrome background={background.id} onBackground={setBackground} />
              <main className="relative px-3 pb-28 pt-24 sm:px-4 lg:pl-24 lg:pr-6">
                <div className="admin-panel mx-auto min-h-[calc(100vh-9.5rem)] max-w-[96rem] rounded-[2rem]">
                  {ADMIN_PAUSED ? <AdminPausedNotice /> : children}
                </div>
              </main>
            </>
          )}
        </AdminAuthGuard>
      </div>
    </AdminAuthProvider>
  );
}
