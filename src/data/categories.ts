import type { Category } from "@/types";

export const categories: Category[] = [
  { id: "women", name: "Woman", slug: "women", description: "Women's fashion" },
  { id: "men", name: "Men", slug: "men", description: "Men's fashion" },
  { id: "unisex", name: "Unisex", slug: "unisex", description: "Styles for everyone" },
  { id: "shoes", name: "Shoes", slug: "shoes", description: "Women's footwear" },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Belts, caps, bags & more",
  },
  { id: "belts", name: "Belts", slug: "belts", description: "Belts" },
  { id: "caps", name: "Caps & Headwear", slug: "caps", description: "Caps and hats" },
  { id: "bags", name: "Bags", slug: "bags", description: "Handbags & more" },
  {
    id: "fragrance",
    name: "Fragrance & Living",
    slug: "fragrance",
    description: "Perfumes & self-care",
  },
];

export type Gender = "women" | "men";

export const menNavCategories: { id: string; name: string; slug: string }[] = [
  { id: "shoes", name: "Shoes", slug: "shoes?gender=men" },
  { id: "trouser", name: "Trouser", slug: "trousers?gender=men" },
  { id: "sweatshirt", name: "Sweatshirt", slug: "sweatshirts?gender=men" },
  { id: "jeans", name: "Jeans", slug: "jeans?gender=men" },
  { id: "hoodies", name: "Hoodies", slug: "hoodies?gender=men" },
  { id: "jackets", name: "Jackets", slug: "jackets?gender=men" },
];

export const navCategories: { id: string; name: string; slug: string; children: { name: string; slug: string }[] }[] = [
  { id: "shoes", name: "Shoes", slug: "shoes?gender=women", children: [] },
  { id: "trouser", name: "Trouser", slug: "trousers?gender=women", children: [] },
  { id: "sweatshirt", name: "Sweatshirt", slug: "sweatshirts?gender=women", children: [] },
  { id: "jeans", name: "Jeans", slug: "jeans?gender=women", children: [] },
  { id: "hoodies", name: "Hoodies", slug: "hoodies?gender=women", children: [] },
  { id: "jackets", name: "Jackets", slug: "jackets?gender=women", children: [] },
  { id: "undergarments", name: "Undergarments", slug: "undergarments?gender=women", children: [] },
];
