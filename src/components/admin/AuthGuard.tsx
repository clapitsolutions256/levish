"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !admin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [admin, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold animate-pulse">
            E
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
