import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Checkout",
  description: "Complete your Empulse order.",
  path: "/checkout",
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
