import { MAX_PRODUCT_IMAGES } from "@/lib/productImageLimits";

export type ProductVariant = {
  size: string;
  color: string;
  stock: number;
};

export type ColorGallery = {
  color: string;
  images: string[];
};

export function normalizeVariants(input: unknown): ProductVariant[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, ProductVariant>();
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const size = String(row.size ?? "").trim().slice(0, 40);
    const color = String(row.color ?? "").trim().slice(0, 40);
    const stock = Math.max(0, Math.min(9999, Math.floor(Number(row.stock) || 0)));
    if (!size && !color) continue;
    const key = `${size.toLowerCase()}|${color.toLowerCase()}`;
    const existing = merged.get(key);
    if (existing) existing.stock = Math.min(9999, existing.stock + stock);
    else merged.set(key, { size, color, stock });
  }
  // Room for a set: 7 colours x 6 top sizes x 6 bottom sizes.
  return [...merged.values()].slice(0, 300);
}

// Sets sell a top and a bottom together. Each size is stored as "Top / Bottom" (e.g. "M / 30")
// and shoppers pick the two halves separately.
const PAIR = " / ";

export function hasPairedSizes(variants: ProductVariant[] | undefined) {
  return Boolean(variants?.length) && variants!.every((variant) => variant.size.includes(PAIR));
}

export function splitPairedSize(size: string) {
  const [top = "", bottom = ""] = size.split(PAIR);
  return { top: top.trim(), bottom: bottom.trim() };
}

export function joinPairedSize(top: string, bottom: string) {
  return `${top}${PAIR}${bottom}`;
}

export function colorLabel(variants: ProductVariant[], fallback = "") {
  const colors = [...new Set(variants.map((variant) => variant.color.trim()).filter(Boolean))];
  if (colors.length) return colors.join(" / ");
  return fallback.trim() || "—";
}

export function lineStock(product: { variants?: ProductVariant[] }, size?: string, color?: string) {
  if (!product.variants?.length) return null;
  return findVariant(product.variants, size ?? "", color ?? "")?.stock ?? 0;
}

export function findVariant(variants: ProductVariant[], size: string, color: string) {
  const wantedSize = size.trim().toLowerCase();
  const wantedColor = color.trim().toLowerCase();
  return variants.find(
    (variant) => variant.size.toLowerCase() === wantedSize && variant.color.toLowerCase() === wantedColor
  );
}

export function totalStock(variants: ProductVariant[] | undefined) {
  return (variants ?? []).reduce((sum, variant) => sum + variant.stock, 0);
}

export function isSold(product: { variants?: ProductVariant[] }) {
  return Boolean(product.variants?.length) && totalStock(product.variants) < 1;
}

export function uniqueValues(variants: ProductVariant[], key: "size" | "color") {
  return [...new Set(variants.map((variant) => variant[key]).filter(Boolean))];
}

export function normalizeColorImages(input: unknown): ColorGallery[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, ColorGallery>();
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const color = String(row.color ?? "").trim().slice(0, 40);
    if (!color) continue;
    const images = (Array.isArray(row.images) ? row.images : [])
      .map((image) => String(image).trim())
      .filter(Boolean)
      .slice(0, MAX_PRODUCT_IMAGES);
    const key = color.toLowerCase();
    const existing = merged.get(key);
    if (existing) existing.images = [...new Set([...existing.images, ...images])].slice(0, MAX_PRODUCT_IMAGES);
    else merged.set(key, { color, images });
  }
  return [...merged.values()].slice(0, 20);
}

export function galleryFor(product: { image: string; images?: string[]; colorImages?: ColorGallery[] }, color?: string) {
  const match = color
    ? product.colorImages?.find((item) => item.color.toLowerCase() === color.trim().toLowerCase() && item.images.length)
    : undefined;
  if (match) return match.images;
  const shared = (product.images?.length ? product.images : [product.image]).filter(Boolean);
  return shared;
}
