import type { Product } from "@/types";
import { slugify } from "@/lib/catalog";
import { sameType } from "@/lib/productTypes";

export type StyleCard = { name: string; href: string; image: string };

// Types on these categories become style cards and style pages (/jackets, /shorts, ...).
const CLOTHING = new Set(["women", "men", "unisex"]);

// Built-in styles keep their order and their existing pages.
const BUILT_IN = [
  { key: "jacket", name: "Jackets", href: "/jackets" },
  { key: "hoodie", name: "Hoodies", href: "/hoodies" },
  { key: "sweatshirt", name: "Sweatshirts", href: "/sweatshirts" },
  { key: "trouser", name: "Trousers", href: "/trousers" },
  { key: "jeans", name: "Jeans", href: "/jeans" },
];

function clothingType(product: Product) {
  return CLOTHING.has(product.categoryId) ? product.subcategory?.trim() ?? "" : "";
}

// The page that lists a clothing type for everyone, e.g. "hoodie" -> "/hoodies".
export function typePath(type: string) {
  return BUILT_IN.find((style) => sameType(style.key, type))?.href ?? `/${slugify(type)}`;
}

export function isBuiltInStyle(label: string) {
  return BUILT_IN.some((style) => sameType(style.key, label));
}

// Products whose type matches a page slug such as "shorts" or "t-shirts".
export function productsOfType(products: Product[], slug: string) {
  const wanted = slug.toLowerCase();
  return products.filter((product) => {
    const type = clothingType(product);
    return Boolean(type) && (slugify(type) === wanted || sameType(slugify(type), wanted));
  });
}

// Admins may type "shorts"; show "Shorts".
function displayName(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// The type's name as admins typed it, taken from the newest product that uses it.
export function typeLabel(products: Product[], slug: string) {
  return displayName(productsOfType(products, slug)[0]?.subcategory?.trim() ?? "");
}

// Every style that has products: shoes, the built-in styles, then any other type in use.
export function styleCards(products: Product[]): StyleCard[] {
  const cards: StyleCard[] = [];
  const shoe = products.find((product) => product.categoryId === "shoes");
  if (shoe) cards.push({ name: "Shoes", href: "/shoes", image: shoe.image });

  for (const style of BUILT_IN) {
    const product = products.find((item) => sameType(clothingType(item), style.key));
    if (product) cards.push({ name: style.name, href: style.href, image: product.image });
  }

  const extra: StyleCard[] = [];
  const seen: string[] = [];
  for (const product of products) {
    const type = clothingType(product);
    if (!type || isBuiltInStyle(type) || seen.some((item) => sameType(item, type))) continue;
    seen.push(type);
    const slug = slugify(type);
    if (slug) extra.push({ name: displayName(type), href: `/${slug}`, image: product.image });
  }
  return [...cards, ...extra.sort((a, b) => a.name.localeCompare(b.name))];
}
