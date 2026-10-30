import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Cart",
  description: "Review the items in your Levish cart.",
  path: "/cart",
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
