import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { blogs } from "@/data/blogs";
import { getActiveProducts, listSavedBrands } from "@/lib/catalog";
import { summarizeBrands } from "@/lib/brands";
import { sameType } from "@/lib/productTypes";
import { wornBy } from "@/lib/showcase";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import type { Product } from "@/types";

export const revalidate = 3600;

const styles = [
  { path: "/jackets", type: "jacket" },
  { path: "/hoodies", type: "hoodie" },
  { path: "/sweatshirts", type: "sweatshirt" },
  { path: "/trousers", type: "trouser" },
  { path: "/jeans", type: "jeans" },
  { path: "/undergarments", type: "undergarments" },
];

const genders = ["women", "men"] as const;

function entry(path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency: priority >= 0.7 ? "daily" : "weekly",
    priority,
  };
}

// Latest change among a listing's products, so search engines recrawl when it changes.
function newest(list: Product[]) {
  const times = list.map((product) => Date.parse(product.updatedAt ?? "")).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Product[] = [];
  let savedBrands: { slug: string; name: string }[] = [];
  try {
    [products, savedBrands] = await Promise.all([getActiveProducts(), listSavedBrands()]);
  } catch {
    // Keep the sitemap available if the live catalog is unreachable.
  }

  // Only listings that have something on them; empty ones are noindex.
  const listings: MetadataRoute.Sitemap = [];
  const add = (path: string, list: Product[], priority: number) => {
    if (list.length) listings.push(entry(path, priority, newest(list)));
  };
  for (const gender of genders) {
    const mine = products.filter(wornBy(gender));
    add(`/${gender}`, mine, 0.9);
    add(`/${gender}?filter=new`, mine.filter((product) => product.new), 0.7);
  }
  for (const category of categories.filter((item) => !genders.includes(item.id as (typeof genders)[number]))) {
    add(`/${category.slug}`, products.filter((product) => product.categoryId === category.id), 0.8);
  }
  const shoes = products.filter((product) => product.categoryId === "shoes");
  add("/shoes?gender=men", shoes.filter((product) => product.subcategory?.toLowerCase() === "men"), 0.7);
  add("/shoes?gender=women", shoes.filter((product) => product.subcategory?.toLowerCase() === "woman"), 0.7);
  for (const style of styles) {
    const all = products.filter((product) => sameType(product.subcategory, style.type));
    add(style.path, all, 0.8);
    for (const gender of genders) add(`${style.path}?gender=${gender}`, all.filter(wornBy(gender)), 0.8);
  }

  return [
    entry("", 1, newest(products)),
    ...listings,
    ...products.map((product) => ({
      ...entry(`/product/${product.slug}`, 0.8, newest([product])),
      images: [...new Set([product.image, ...(product.images ?? [])])].filter(Boolean).slice(0, 5).map(absoluteUrl),
    })),
    entry("/brands", 0.7),
    ...summarizeBrands(products, savedBrands)
      .filter((brand) => brand.count > 0)
      .map((brand) => entry(`/brands/${brand.slug}`, 0.7)),
    entry("/blog", 0.6),
    ...blogs.map((post) => entry(`/blog/${post.slug}`, 0.6, new Date(post.date))),
    entry("/about", 0.5),
    entry("/contact", 0.5),
    entry("/faqs", 0.5),
    entry("/returns", 0.4),
    entry("/privacy", 0.3),
  ];
}
