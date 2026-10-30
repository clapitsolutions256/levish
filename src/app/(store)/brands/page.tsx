import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBrands } from "@/lib/catalog";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Brands",
  description: "Shop original Zara, Polo Ralph Lauren, On and more at Levish. Every brand in one place, with delivery across Pakistan.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Brands", path: "/brands" }])} />
      <div className="mb-8 animate-fade-up">
        <nav className="text-sm text-[var(--muted)] mb-1">
          <Link href="/" className="hover:text-[var(--accent)]">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span className="text-[var(--foreground)]">Brands</span>
        </nav>
        <h1 className="section-heading">Shop by brand</h1>
        <p className="type-copy mt-2 text-[var(--muted)]">Pick a brand to see everything we have from it.</p>
      </div>
      {brands.length === 0 ? (
        <p className="type-copy py-12 text-center text-[var(--muted)]">
          No brands yet.{" "}
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Back to home
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <Link key={brand.slug} href={`/brands/${brand.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-white">
                {brand.image ? (
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[var(--sage-tint)] p-4 text-center text-2xl font-semibold text-[var(--accent)] transition-transform duration-500 group-hover:scale-105">
                    {brand.name}
                  </div>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold transition-colors group-hover:text-[var(--accent)]">{brand.name}</h2>
              <p className="text-sm text-[var(--muted)]">
                {brand.count ? `${brand.count} product${brand.count !== 1 ? "s" : ""}` : "Coming soon"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
