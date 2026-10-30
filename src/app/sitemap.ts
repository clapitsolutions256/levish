import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { blogs } from "@/data/blogs";
import { getActiveProducts, listSavedBrands } from "@/lib/catalog";
import { summarizeBrands } from "@/lib/brands";
import { SITE_URL } from "@/lib/site";
import type { Product } from "@/types";

export const revalidate = 3600;

const stylePaths = ["/jackets", "/hoodies", "/sweatshirts", "/trousers", "/jeans"];
const subcategoryPaths = [
  ...["tops", "dresses", "tshirts", "bottoms", "blazers", "sweaters", "jackets"].map((slug) => `/women/${slug}`),
  "/accessories/eyewear",
];

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: priority >= 0.7 ? "daily" : "weekly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Product[] = [];
  let savedBrands: { slug: string; name: string }[] = [];
  try {
    [products, savedBrands] = await Promise.all([getActiveProducts(), listSavedBrands()]);
  } catch {
    // Keep the sitemap available if the live catalog is unreachable.
  }

  const genderPaths = ["/women?filter=new", "/men?filter=new"];

  return [
    entry("", 1),
    ...categories.map((category) => entry(`/${category.slug}`, 0.8)),
    ...stylePaths.map((path) => entry(path, 0.8)),
    ...subcategoryPaths.map((path) => entry(path, 0.7)),
    ...genderPaths.map((path) => entry(path, 0.7)),
    ...products.map((product) => entry(`/product/${product.slug}`, 0.8)),
    entry("/brands", 0.7),
    ...summarizeBrands(products, savedBrands).map((brand) => entry(`/brands/${brand.slug}`, 0.7)),
    entry("/blog", 0.6),
    ...blogs.map((post) => entry(`/blog/${post.slug}`, 0.6)),
    entry("/about", 0.5),
    entry("/contact", 0.5),
    entry("/faqs", 0.5),
    entry("/returns", 0.4),
    entry("/privacy", 0.3),
  ];
}
