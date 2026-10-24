import type { ComponentProps } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { brandHref, brandSlug } from "@/lib/brands";
import { ComingSoon } from "@/components/ComingSoon";
import type { Product } from "@/types";

function filterHref(basePath: string, slug?: string) {
  const url = new URL(basePath, "http://local");
  if (slug) url.searchParams.set("brand", slug);
  else url.searchParams.delete("brand");
  return `${url.pathname}${url.search}`;
}

function Grid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}

export function BrandSections({
  products,
  basePath,
  brand,
  heading,
  upcoming = [],
  empty,
}: {
  products: Product[];
  basePath: string;
  brand?: string;
  heading: string;
  upcoming?: string[];
  empty?: ComponentProps<typeof ComingSoon>;
}) {
  const stocked = [...new Set(products.map((product) => product.brand?.trim()).filter((item): item is string => Boolean(item)))].sort();
  const brands = [...new Set([...stocked, ...upcoming])].sort();
  const active = brands.find((item) => brandSlug(item) === brand?.toLowerCase());
  const shown = active ? products.filter((product) => product.brand?.trim() === active) : products;
  const unbranded = products.filter((product) => !product.brand?.trim());
  const grouped = !active && stocked.length + (unbranded.length ? 1 : 0) > 1;

  const chip = (selected: boolean) =>
    `rounded-full px-4 py-1.5 text-sm transition-colors ${
      selected
        ? "bg-[#4a142a] font-medium text-white"
        : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[#4a142a] hover:text-[#4a142a]"
    }`;

  return (
    <>
      {brands.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-[var(--muted)]">Brand:</span>
          <Link href={filterHref(basePath)} className={chip(!active)} scroll={false}>
            All
          </Link>
          {brands.map((item) => (
            <Link key={item} href={filterHref(basePath, brandSlug(item))} className={chip(item === active)} scroll={false}>
              {item}
            </Link>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        active ? (
          <ComingSoon
            title={`${active} ${heading.toLowerCase()} are on their way`}
            text={`We're putting together a new ${active} range. Check back soon.`}
            {...(products.length ? { href: filterHref(basePath), cta: `Shop all ${heading}` } : {})}
          />
        ) : (
          <ComingSoon
            title={`${heading} are on their way`}
            text={`We're putting together a new range of ${heading.toLowerCase()}. Check back soon.`}
            {...empty}
          />
        )
      ) : (
        <p className="text-sm text-[var(--muted)] mb-6">
          {shown.length} product{shown.length !== 1 ? "s" : ""}
        </p>
      )}
      {shown.length === 0 ? null : grouped ? (
        <div className="space-y-12">
          {stocked.map((item) => (
            <section key={item}>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold">{item}</h2>
                <Link href={brandHref(item)} className="text-sm text-[var(--accent)] hover:underline">
                  Shop all {item}
                </Link>
              </div>
              <Grid products={products.filter((product) => product.brand?.trim() === item)} />
            </section>
          ))}
          {unbranded.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">More {heading}</h2>
              <Grid products={unbranded} />
            </section>
          )}
        </div>
      ) : (
        <Grid products={shown} />
      )}
    </>
  );
}
