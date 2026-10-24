import { revalidateTag, unstable_cache } from "next/cache";
import type { Product } from "@/types";
import { getSupabase } from "@/lib/supabase";
import { brandSlug, summarizeBrands } from "@/lib/brands";
import { normalizeColorImages, normalizeVariants, type ColorGallery } from "@/lib/variants";
import { cleanSalePercent, withSale } from "@/lib/sale";
import { sameType } from "@/lib/productTypes";
import { PRODUCTS_PAUSED } from "@/lib/storeStatus";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  sale_percent?: number | null;
  category_id: Product["categoryId"];
  subcategory: string;
  brand?: string | null;
  color: string;
  variants: unknown;
  color_images?: unknown;
  image: string;
  images: string[] | null;
  description: string;
  featured: boolean;
  is_new: boolean;
  active: boolean;
  created_at: string;
  updated_at: string | null;
};

const subcategorySlugToLabel: Record<string, Record<string, string>> = {
  women: {
    tops: "Tops",
    dresses: "Dresses",
    tshirts: "T-Shirts",
    bottoms: "Bottoms",
    blazers: "Blazers",
    sweaters: "Sweaters",
    jackets: "Jacket",
  },
};

function toProduct(row: ProductRow): Product {
  const gallery = Array.isArray(row.images) ? row.images.map(String).filter(Boolean) : [];
  const images = gallery.length ? gallery : row.image ? [row.image] : [];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
    salePercent: cleanSalePercent(row.sale_percent) || undefined,
    categoryId: row.category_id,
    subcategory: row.subcategory || undefined,
    brand: row.brand?.trim() || undefined,
    color: row.color,
    variants: normalizeVariants(row.variants),
    colorImages: normalizeColorImages(row.color_images),
    image: images[0] || row.image,
    images,
    description: row.description || undefined,
    featured: row.featured,
    new: row.is_new,
    active: row.active,
  };
}

export function collectImages(body: Record<string, unknown>) {
  const listed = Array.isArray(body.images) ? body.images.map((item) => String(item).trim()).filter(Boolean) : [];
  const single = String(body.image ?? "").trim();
  const images = [...new Set(listed.length ? listed : single ? [single] : [])].slice(0, 8);
  if (!images.length) return { error: "Add at least one product image." as const };
  return { image: images[0], images };
}

export function resolveProductPhotos(body: Record<string, unknown>, colorImages: ColorGallery[]) {
  const photos = collectImages(body);
  const first = colorImages.find((item) => item.images.length);
  if ("error" in photos) {
    if (!first) return photos;
    return { image: first.images[0], images: first.images };
  }
  if (first) return { image: first.images[0], images: photos.images };
  return photos;
}

export async function listProducts(options?: { activeOnly?: boolean }) {
  const supabase = getSupabase();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (options?.activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(toProduct);
}

const PRODUCTS_TAG = "products";

// Store pages read the catalog from a server cache instead of Supabase on every request.
// Anything that changes products or stock calls refreshCatalog(); the 5 minute expiry is a fallback.
// Store pages get sale prices applied. Admin uses listProducts() and sees the original price.
const cachedActiveProducts = unstable_cache(
  async () => (await listProducts({ activeOnly: true })).map(withSale),
  ["active-products"],
  { tags: [PRODUCTS_TAG], revalidate: 300 }
);

export async function getActiveProducts() {
  if (PRODUCTS_PAUSED) return [];
  return cachedActiveProducts();
}

export function refreshCatalog() {
  try {
    revalidateTag(PRODUCTS_TAG, { expire: 0 });
  } catch (err) {
    console.error("Catalog refresh error:", err);
  }
}

export async function listSavedBrands() {
  const { data, error } = await getSupabase().from("brands").select("slug, name, types").order("name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as { slug: string; name: string; types: string[] | null }[]).map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    types: (brand.types ?? []).map((type) => type.toLowerCase()),
  }));
}

// Brands set up for a product type (e.g. "trouser") that may not have products yet.
export async function getBrandNamesForType(type: string) {
  const key = type.toLowerCase();
  try {
    return (await listSavedBrands()).filter((brand) => brand.types.some((item) => sameType(item, key))).map((brand) => brand.name);
  } catch (err) {
    console.error("Brands error:", err);
    return [];
  }
}

export async function saveBrand(name: string) {
  const clean = name.trim();
  const slug = brandSlug(clean);
  if (!clean || !slug) return;
  const { error } = await getSupabase().from("brands").upsert({ slug, name: clean }, { onConflict: "slug", ignoreDuplicates: true });
  if (error) throw error;
}

export async function getBrands() {
  const [products, saved] = await Promise.all([getActiveProducts(), listSavedBrands()]);
  return summarizeBrands(products, saved);
}

export async function getBrand(slug: string) {
  return (await getBrands()).find((brand) => brand.slug === slug.toLowerCase());
}

export async function getProductsByBrand(slug: string) {
  const products = await getActiveProducts();
  return products.filter((product) => product.brand && brandSlug(product.brand) === slug.toLowerCase());
}

export async function getProductsByCategory(categoryId: string) {
  const products = await getActiveProducts();
  return products.filter((product) => product.categoryId === categoryId);
}

export async function getProductsByCategoryAndSubcategory(categoryId: string, subcategorySlug: string) {
  const products = await getActiveProducts();
  const base = products.filter((product) => product.categoryId === categoryId);
  if (categoryId === "shoes") {
    if (subcategorySlug !== "women") return base;
    return base.filter((product) => product.subcategory?.toLowerCase() === "woman");
  }
  if (categoryId === "accessories" && subcategorySlug.toLowerCase() === "eyewear") {
    return base.filter((product) => product.subcategory?.toLowerCase() === "eyewear");
  }
  const map = subcategorySlugToLabel[categoryId];
  if (!map) return base;
  const label = map[subcategorySlug.toLowerCase()];
  if (!label) return base;
  return base.filter((product) => sameType(product.subcategory, label));
}

export async function getProductsByCategoryNew(categoryId: string) {
  const products = await getActiveProducts();
  return products.filter((product) => product.categoryId === categoryId && product.new);
}

export async function getProductBySlug(slug: string) {
  const products = await getActiveProducts();
  return products.find((product) => product.slug === slug);
}

export async function getFeaturedProducts() {
  const products = await getActiveProducts();
  return products.filter((product) => product.featured);
}

export async function getNewProducts() {
  const products = await getActiveProducts();
  return products.filter((product) => product.new);
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
