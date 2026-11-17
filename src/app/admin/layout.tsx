import type { Metadata } from "next";
import { AdminAppShell } from "@/components/admin/AppShell";

export const metadata: Metadata = {
  title: { absolute: "Levish admin" },
  robots: { index: false, follow: false },
};

// Admin always shows the live data, never a cached copy.
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-gray-900">
      <AdminAppShell>{children}</AdminAppShell>
    </div>
  );
}
