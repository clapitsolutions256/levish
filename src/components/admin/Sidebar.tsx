"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

const nav = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-[#4a142a] bg-white rounded-md p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-[#4a142a] bg-white rounded-md p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Banners",
    href: "/admin/banners",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-[#4a142a] bg-white rounded-md p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-[#4a142a] bg-white rounded-md p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-[#4a142a] bg-white rounded-md p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-[#4a142a] bg-white rounded-md p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-gray-950 text-white flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-sm font-bold">
            E
          </div>
          <span className="text-lg font-semibold tracking-tight">Empulse Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-semibold">
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-medium">{admin?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
            title="Sign out"
            className="p-2 rounded-lg bg-white text-[#4a142a] hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
