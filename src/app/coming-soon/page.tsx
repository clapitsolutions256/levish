import type { Metadata } from "next";
import Image from "next/image";
import { assets } from "@/data/assets";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Coming soon",
  description: "Empulse is opening soon. Fashion, footwear, and lifestyle.",
  path: "/coming-soon",
});

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 py-16 text-center">
      <Image
        src={assets.logo}
        alt="Levish"
        width={1595}
        height={541}
        priority
        className="h-12 w-auto md:h-16"
      />
      <p className="eyebrow mt-12">Opening soon</p>
      <h1 className="section-heading mt-4 text-[#2c2825]">Coming soon</h1>
      <p className="type-copy mt-5 max-w-md text-[#6b6560]">
        Fashion, footwear, and lifestyle. A new Empulse store is on the way.
      </p>
    </main>
  );
}
