export type CategoryId =
  | "women"
  | "men"
  | "unisex"
  | "shoes"
  | "accessories"
  | "belts"
  | "caps"
  | "bags"
  | "fragrance";

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  description?: string;
  parent?: "women"; // for sub-categories
  image?: string;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface ColorGallery {
  color: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  salePercent?: number;
  categoryId: CategoryId;
  subcategory?: string;
  brand?: string;
  color: string;
  variants?: ProductVariant[];
  colorImages?: ColorGallery[];
  image: string;
  images?: string[];
  description?: string;
  featured?: boolean;
  new?: boolean;
  active?: boolean;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}
