import type { Category } from "@/types";

export const categories: Category[] = [
  { id: "women", name: "Woman", slug: "women", description: "Women's fashion" },
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

export const navCategories: { id: string; name: string; slug: string; children: { name: string; slug: string }[] }[] = [
  { id: "shoes", name: "Shoes", slug: "shoes/women", children: [] },
  { id: "trouser", name: "Trouser", slug: "women?type=trouser", children: [] },
  { id: "sweatshirt", name: "Sweatshirt", slug: "women?type=sweatshirt", children: [] },
  { id: "jeans", name: "Jeans", slug: "women?type=jeans", children: [] },
  { id: "hoodies", name: "Hoodies", slug: "women?type=hoodie", children: [] },
  { id: "jackets", name: "Jackets", slug: "women?type=jacket", children: [] },
  { id: "undergarments", name: "Undergarments", slug: "women?type=undergarments", children: [] },
];
