export const SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 300;

// Free shipping is decided on the cart value before any promo discount.
export function shippingFor(subtotal: number) {
  return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
