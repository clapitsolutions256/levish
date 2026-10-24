import type { Metadata } from "next";
import { AccountView } from "@/components/AccountView";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Profile",
  description: "View your Empulse orders and update your account.",
  path: "/account",
});

export default function AccountPage() {
  return <AccountView />;
}
