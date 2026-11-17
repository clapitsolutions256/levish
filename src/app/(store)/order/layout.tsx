import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Order",
  description: "Levish order details.",
  path: "/order",
});

// An order's status changes, so its page is built fresh on every visit.
export const dynamic = "force-dynamic";

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
