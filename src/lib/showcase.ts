import type { Product } from "@/types";
import type { Gender } from "@/data/categories";
import { sameType } from "@/lib/productTypes";
import { isSold } from "@/lib/variants";

const TOPS = ["sweatshirt", "hoodie", "jacket"];
const BOTTOMS = ["trouser", "jeans"];

export type Look = { id: string; gender: Gender; items: Product[] };

function wears(product: Product, gender: Gender) {
  if (product.categoryId === "shoes") return product.subcategory?.toLowerCase() === (gender === "women" ? "woman" : "men");
  return product.categoryId === gender || product.categoryId === "unisex";
}

function ofTypes(products: Product[], types: string[]) {
  return products.filter((product) => types.some((type) => sameType(product.subcategory, type)));
}

/** Up to `count` pieces for the orbit, one per type first so the run feels varied. */
export function orbitPieces(products: Product[], count = 6) {
  const pool = products.filter((product) => !isSold(product) && product.categoryId !== "shoes");
  const picked: Product[] = [];
  for (const type of [...TOPS, ...BOTTOMS]) {
    const match = pool.find((product) => sameType(product.subcategory, type) && !picked.includes(product));
    if (match) picked.push(match);
  }
  for (const product of pool) {
    if (picked.length >= count) break;
    if (!picked.includes(product)) picked.push(product);
  }
  return picked.slice(0, count);
}

/** Outfits of a top, a bottom and (when stocked) shoes, alternating men's and women's. */
export function buildLooks(products: Product[], max = 6): Look[] {
  const available = products.filter((product) => !isSold(product));
  const byGender = (["men", "women"] as const).map((gender) => {
    const mine = available.filter((product) => wears(product, gender));
    const tops = ofTypes(mine, TOPS);
    const bottoms = ofTypes(mine, BOTTOMS);
    const shoes = mine.filter((product) => product.categoryId === "shoes");
    if (!bottoms.length) return [];
    return tops.map((top, index) => ({
      id: `${gender}-${top.id}`,
      gender,
      items: [top, bottoms[index % bottoms.length], ...(shoes.length ? [shoes[index % shoes.length]] : [])],
    }));
  });
  const looks: Look[] = [];
  for (let index = 0; looks.length < max && byGender.some((list) => index < list.length); index++) {
    for (const list of byGender) {
      if (list[index] && looks.length < max) looks.push(list[index]);
    }
  }
  return looks;
}

/** Up to `count` pieces for a section, one per type first so the fan shows its range. */
export function sectionPieces(products: Product[], test: (product: Product) => boolean, count = 4) {
  const pool = products.filter((product) => test(product) && !isSold(product));
  const picked: Product[] = [];
  for (const type of [...TOPS, ...BOTTOMS, "undergarments"]) {
    const match = pool.find((product) => sameType(product.subcategory, type) && !picked.includes(product));
    if (match) picked.push(match);
  }
  for (const product of pool) {
    if (picked.length >= count) break;
    if (!picked.includes(product)) picked.push(product);
  }
  return picked.slice(0, count);
}

export function wornBy(gender: Gender) {
  return (product: Product) => wears(product, gender);
}

const MENU_TYPES: Record<string, string> = {
  trouser: "trouser",
  sweatshirt: "sweatshirt",
  jeans: "jeans",
  hoodies: "hoodie",
  jackets: "jacket",
  undergarments: "undergarments",
};

export type MenuThumbs = Record<Gender, Record<string, string>>;

/** One photo per menu entry (keyed by the nav item id) for the phone shop menu. */
export function menuThumbnails(products: Product[]): MenuThumbs {
  const thumbs: MenuThumbs = { women: {}, men: {} };
  for (const gender of ["women", "men"] as const) {
    const mine = products.filter((product) => wears(product, gender) && !isSold(product));
    const shoe = mine.find((product) => product.categoryId === "shoes");
    if (shoe) thumbs[gender].shoes = shoe.image;
    for (const [id, type] of Object.entries(MENU_TYPES)) {
      const match = mine.find((product) => product.categoryId !== "shoes" && sameType(product.subcategory, type));
      if (match) thumbs[gender][id] = match.image;
    }
    if (mine[0]) thumbs[gender].all = mine[0].image;
  }
  return thumbs;
}

export type CartSuggestion = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  brand?: string;
  categoryId: string;
  type: string;
  wearer: string;
  featured: boolean;
};

/** "men", "women" or "unisex"; shoes take theirs from the shoe type. */
export function wearerOf(product: Pick<Product, "categoryId" | "subcategory">): string {
  if (product.categoryId === "shoes") return product.subcategory?.toLowerCase() === "woman" ? "women" : "men";
  return product.categoryId;
}

/** In-stock pieces the cart drawer can suggest, trimmed to what a small card needs. */
export function suggestionPool(products: Product[]): CartSuggestion[] {
  return products
    .filter((product) => !isSold(product))
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name.replace(/\.$/, ""),
      image: product.image,
      price: product.price,
      brand: product.brand,
      categoryId: product.categoryId,
      type: product.categoryId === "shoes" ? "shoes" : (product.subcategory ?? "").toLowerCase(),
      wearer: wearerOf(product),
      featured: Boolean(product.featured),
    }));
}
