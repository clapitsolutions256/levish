import type { CategoryId } from "@/types";

// Every clothing category offers the same types. The store's style pages (/trousers, /jeans,
// /sweatshirts, /hoodies, /jackets) look for "Trouser", "Jeans", "Sweatshirt", "Hoodie" and "Jacket".
const clothingTypes = [
  "Tops",
  "Shirts",
  "T-Shirts",
  "Polo",
  "Dresses",
  "Bottoms",
  "Trouser",
  "Jeans",
  "Sweatshirt",
  "Hoodie",
  "Sweaters",
  "Jacket",
  "Blazers",
  "Undergarments",
];

export const productCategories: {
  id: CategoryId;
  name: string;
  subcategories: string[];
}[] = [
  { id: "women", name: "Woman", subcategories: clothingTypes },
  { id: "men", name: "Men", subcategories: clothingTypes },
  { id: "unisex", name: "Unisex", subcategories: clothingTypes },
  { id: "shoes", name: "Shoes", subcategories: ["Woman", "Men"] },
  { id: "accessories", name: "Accessories", subcategories: ["Eyewear"] },
  { id: "belts", name: "Belts", subcategories: [] },
  { id: "caps", name: "Caps & Headwear", subcategories: [] },
  { id: "bags", name: "Bags", subcategories: [] },
  { id: "fragrance", name: "Fragrance & Living", subcategories: [] },
];

export function isCategoryId(value: string): value is CategoryId {
  return productCategories.some((category) => category.id === value);
}
