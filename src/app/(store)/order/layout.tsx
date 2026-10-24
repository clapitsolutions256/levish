import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Order",
  description: "Empulse order details.",
  path: "/order",
});

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
