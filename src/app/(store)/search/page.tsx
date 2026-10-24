import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/catalog";
import { SearchView } from "./SearchView";
import { privateMeta } from "@/lib/site";
import { PRODUCTS_PAUSED } from "@/lib/storeStatus";
import { ProductsPausedNotice } from "@/components/ComingSoon";

export const metadata: Metadata = privateMeta({
  title: "Search",
  description: "Search the Empulse catalog.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  if (PRODUCTS_PAUSED) {
    return (
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
        <ProductsPausedNotice />
      </div>
    );
  }
  const products = await getActiveProducts();
  return <SearchView initialProducts={products} initialQuery={q ?? ""} />;
}
