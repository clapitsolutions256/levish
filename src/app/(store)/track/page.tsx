import type { Metadata } from "next";
import { TrackOrder } from "@/components/TrackOrder";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Track your order",
  description: "Find your Levish orders with the phone number you ordered with.",
  path: "/track",
});

export default function TrackPage() {
  return <TrackOrder />;
}
