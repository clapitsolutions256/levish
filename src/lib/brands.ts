import type { Product } from "@/types";

export type BrandSummary = {
  name: string;
  slug: string;
  count: number;
  image: string;
};

export function brandSlug(brand: string) {
  return brand
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function brandHref(brand: string) {
  return `/brands/${brandSlug(brand)}`;
}

export function summarizeBrands(products: Product[], saved: { slug: string; name: string }[] = []): BrandSummary[] {
  const map = new Map<string, BrandSummary>();
  for (const brand of saved) map.set(brand.slug, { name: brand.name, slug: brand.slug, count: 0, image: "" });
  for (const product of products) {
    const name = product.brand?.trim();
    if (!name) continue;
    const slug = brandSlug(name);
    const found = map.get(slug);
    if (found) {
      found.count += 1;
      if (!found.image) found.image = product.image;
    } else map.set(slug, { name, slug, count: 1, image: product.image });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
