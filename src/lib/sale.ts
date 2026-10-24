import type { Product } from "@/types";

export const MAX_SALE_PERCENT = 90;

export function cleanSalePercent(value: unknown) {
  const percent = Math.floor(Number(value) || 0);
  return Math.min(MAX_SALE_PERCENT, Math.max(0, percent));
}

export function salePrice(price: number, percent: number) {
  return Math.round((price * (100 - cleanSalePercent(percent))) / 100);
}

// Store pages show the sale price as the price and the original price struck through.
// The database keeps the original price, so removing the sale restores it.
export function withSale(product: Product): Product {
  const percent = cleanSalePercent(product.salePercent);
  if (!percent) return { ...product, salePercent: undefined };
  return { ...product, price: salePrice(product.price, percent), compareAtPrice: product.price, salePercent: percent };
}
