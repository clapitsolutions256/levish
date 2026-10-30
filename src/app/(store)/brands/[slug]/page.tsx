import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getBrand, getProductsByBrand } from "@/lib/catalog";
import { ComingSoon } from "@/components/ComingSoon";
import { categories } from "@/data/categories";
import { MetaCatalogView } from "@/components/MetaPixel";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import type { Product } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
};

function typeLabel(product: Product) {
  if (product.categoryId === "shoes") return "Shoes";
  if (product.subcategory) return product.subcategory;
  return categories.find((item) => item.id === product.categoryId)?.name ?? "More";
}

function typeSlug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand" };
  const name = brand.name;
  const meta = pageMeta({
    title: `Original ${name} in Pakistan`,
    description: brand.count
      ? `Shop ${brand.count} original ${name} styles at Levish. Check before you pay, delivery across Pakistan and free shipping over Rs. 5,000.`
      : `Original ${name} is coming soon to Levish. Delivery across Pakistan and free shipping over Rs. 5,000.`,
    path: `/brands/${slug}`,
  });
  return brand.count ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { type } = await searchParams;
  const [brand, products] = await Promise.all([getBrand(slug), getProductsByBrand(slug)]);
  if (!brand) notFound();
  const name = brand.name;

  const types = [...new Set(products.map(typeLabel))].sort();
  const activeType = types.find((item) => typeSlug(item) === type?.toLowerCase());
  const list = activeType ? products.filter((product) => typeLabel(product) === activeType) : products;
  const path = `/brands/${slug}`;

  const chip = (selected: boolean) =>
    `rounded-full px-4 py-1.5 text-sm transition-colors ${
      selected
        ? "bg-[var(--accent)] font-medium text-white"
        : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
    }`;

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10">
      <JsonLd data={collectionJsonLd({ name, path, products: list })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Brands", path: "/brands" },
          { name, path },
        ])}
      />
      <MetaCatalogView name={name} category={slug} ids={list.map((product) => product.id)} />
      <div className="mb-8 animate-fade-up">
        <nav className="text-sm text-[var(--muted)] mb-1">
          <Link href="/" className="hover:text-[var(--accent)]">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link href="/brands" className="hover:text-[var(--accent)]">
            Brands
          </Link>
          <span className="mx-1">/</span>
          <span className="text-[var(--foreground)]">{name}</span>
        </nav>
        <h1 className="section-heading">{name}</h1>
        {types.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={path} className={chip(!activeType)} scroll={false}>
              All
            </Link>
            {types.map((item) => (
              <Link key={item} href={`${path}?type=${typeSlug(item)}`} className={chip(item === activeType)} scroll={false}>
                {item}
              </Link>
            ))}
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <ComingSoon
          title={`${name} is on its way`}
          text={`We're putting together a new ${name} collection. Check back soon.`}
          href="/brands"
          cta="Shop other brands"
        />
      ) : (
        <>
          <p className="text-sm text-[var(--muted)] mb-6">
            {list.length} product{list.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {list.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
