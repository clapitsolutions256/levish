"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { galleryFor, lineStock } from "@/lib/variants";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    itemCount,
    total,
    ready,
  } = useCart();

  if (!ready && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-[var(--muted)]">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="section-heading">Your cart is empty</h1>
        <p className="type-copy mt-2 text-[var(--muted)]">
          Add something cozy from our collection.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-[#4a142a] text-white font-medium rounded-lg hover:bg-[#350e1e]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-heading mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <ul className="space-y-6">
            {items.map((item) => {
              const stock = lineStock(item.product, item.size, item.color);
              const atLimit = stock != null && item.quantity >= stock;
              return (
              <li
                key={`${item.product.id}-${item.size ?? ""}-${item.color ?? ""}`}
                className="flex gap-4 py-6 border-b border-[var(--border)]"
              >
                <div className="relative w-24 h-32 md:w-28 md:h-36 rounded-lg overflow-hidden bg-[var(--cream)] shrink-0">
                  <Image
                    src={galleryFor(item.product, item.color)[0] || item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-medium hover:text-[var(--accent)]"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    {item.color || item.product.color}
                    {item.size && ` · ${item.size}`}
                  </p>
                  <p className="mt-2 font-medium">
                    {formatPrice(item.product.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          Math.max(0, item.quantity - 1),
                          item.size,
                          item.color
                        )
                      }
                      className="w-8 h-8 rounded border border-[var(--border)] flex items-center justify-center hover:bg-[var(--cream)]"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={atLimit}
                      onClick={() => {
                        if (atLimit) return;
                        updateQuantity(item.product.id, item.quantity + 1, item.size, item.color);
                      }}
                      className="w-8 h-8 rounded border border-[var(--border)] flex items-center justify-center hover:bg-[var(--cream)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      className="ml-4 text-sm text-[var(--muted)] hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  {stock === 0 ? (
                    <p className="mt-2 text-sm text-red-700">Out of stock</p>
                  ) : atLimit ? (
                    <p className="mt-2 text-sm text-[#4a142a]">Only {stock} available</p>
                  ) : null}
                </div>
              </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="sticky top-24 bg-[var(--cream)] rounded-2xl p-6 border border-[var(--border)]">
            <h2 className="section-heading">Order summary</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Subtotal ({itemCount} items)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-[var(--muted)] pt-2">
                Shipping and taxes calculated at checkout.
              </p>
            </div>
            <Link
              href="/checkout"
              className="block w-full mt-6 py-4 bg-[#4a142a] text-white font-medium rounded-lg hover:bg-[#350e1e] transition text-center"
            >
              Check out
            </Link>
            <Link
              href="/"
              className="block mt-4 text-center text-sm text-[var(--accent)] hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
