import type { Metadata } from "next";
import { AdminAppShell } from "@/components/admin/AppShell";

export const metadata: Metadata = {
  title: { absolute: "Empulse admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      <AdminAppShell>{children}</AdminAppShell>
    </div>
  );
}
