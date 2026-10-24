"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminAuthGuard } from "./AuthGuard";
import { AdminSidebar } from "./Sidebar";
import { ADMIN_PAUSED, PAUSED_NOTICE } from "@/lib/storeStatus";

function AdminPausedNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 lg:p-8">
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

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        {isLoginPage ? (
          children
        ) : (
          <>
            <AdminSidebar />
            <main className="ml-64 min-h-screen">{ADMIN_PAUSED ? <AdminPausedNotice /> : children}</main>
          </>
        )}
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
