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

// Checkout shows this before the order is placed; the server works it out again from its own prices.
export function promoDiscount(promo: { type: "percent" | "fixed"; value: number }, subtotal: number) {
  const amount = promo.type === "percent" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.max(0, Math.min(subtotal, amount));
}

/** On sale: a sale percent is set, or the price is below the crossed-out price (the card shows "% off" for both). */
export function onSale(product: Product) {
  return Boolean(product.salePercent) || (product.compareAtPrice ?? 0) > product.price;
}

// The piece that opens every sale listing (Seamless Push-Up Bra).
const SALE_LEAD = "seamless-crisscross-back-push-up-bra-comfortable-breathable";

/** The same list with the sale lead moved to the front, when it is in the list. */
export function saleLeadFirst<T extends { slug: string }>(products: T[]) {
  return [...products.filter((product) => product.slug === SALE_LEAD), ...products.filter((product) => product.slug !== SALE_LEAD)];
}
