import type { Product } from "@/types";
import { sameType } from "@/lib/productTypes";

export const dealStyles = [
  { name: "Trousers", slug: "trousers", type: "trouser" },
  { name: "Jackets", slug: "jackets", type: "jacket" },
  { name: "Sweatshirts", slug: "sweatshirts", type: "sweatshirt" },
] as const;

export function dealProducts(products: Product[]) {
  return products.filter((product) => dealStyles.some((style) => sameType(product.subcategory, style.type)));
}
