"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";
import { ProductPurchase } from "@/components/ProductPurchase";
import { SwipeGallery } from "@/components/SwipeGallery";
import { ImageMagnifier } from "@/components/ImageMagnifier";
import { galleryFor, isSold, uniqueValues } from "@/lib/variants";
import { SoldBadge } from "@/components/SoldBadge";
import { SaleTag } from "@/components/SaleTag";
import { trackViewContent } from "@/lib/metaPixel";
import { ProductPromises } from "@/components/ProductPromises";
import { ProductBuyBar } from "@/components/ProductBuyBar";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

export function ProductDetail({ product, initialColor }: { product: Product; initialColor?: string }) {
  const [color, setColor] = useState(() => {
    const colors = uniqueValues(product.variants ?? [], "color");
    return colors.find((item) => item.toLowerCase() === initialColor?.trim().toLowerCase()) ?? colors[0] ?? "";
  });
  const photos = galleryFor(product, color);
  const [active, setActive] = useState(0);
  const purchase = useRef<HTMLDivElement>(null);
  const onColorChange = useCallback((next: string) => {
    setColor((currentColor) => {
      if (currentColor !== next) setActive(0);
      return next;
    });
  }, []);

  useEffect(() => {
    trackViewContent({
      id: product.id,
      name: product.name,
      category: product.categoryId,
      price: product.price,
    });
  }, [product.id, product.name, product.categoryId, product.price]);

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-12">
      <SwipeGallery
        photos={photos}
        active={active}
        onIndex={setActive}
        alt={product.name}
        imageClassName="object-contain"
        sizes="(max-width: 768px) 100vw, 60vw"
        priority
        className="aspect-square rounded-2xl bg-white"
      >
        <ImageMagnifier src={photos[active] ?? photos[0] ?? product.image} />
        {product.new ? (
          <span className="absolute top-4 left-4 z-10 rounded bg-[var(--foreground)] px-3 py-1 text-sm font-medium text-[var(--cream)]">
            New
          </span>
        ) : null}
        {product.salePercent ? <SaleTag percent={product.salePercent} large /> : null}
        {isSold(product) ? <SoldBadge large /> : null}
      </SwipeGallery>

      <div>
        <p className="text-sm uppercase tracking-wider text-[var(--muted)]">
          {product.brand ? (
            <>
              <span className="font-semibold text-[var(--accent)]">{product.brand}</span>
              <span className="mx-2">·</span>
            </>
          ) : null}
          {product.color}
        </p>
        <h1 className="section-heading mt-2">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-xl font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-[var(--muted)] line-through">{formatPrice(product.compareAtPrice)}</span>
          ) : null}
          {product.salePercent ? (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-semibold text-red-600">{product.salePercent}% off</span>
          ) : null}
        </div>
        {photos.length > 1 ? (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${
                  index === active ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === active}
              >
                <Image src={photo} alt="" fill className="object-contain" sizes="96px" />
              </button>
            ))}
          </div>
        ) : null}

        <div ref={purchase} className="scroll-mt-24">
          <ProductPurchase compact product={product} onColorChange={onColorChange} initialColor={color} />
        </div>
        <ProductPromises />

        {/* Details come after the buy button, so choosing a size never needs a long scroll. */}
        {product.description ? (
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Product details</h2>
            <p className="mt-2 whitespace-pre-line text-base leading-7 text-[var(--muted)]">{product.description}</p>
          </div>
        ) : null}
      </div>
      {isSold(product) ? null : <ProductBuyBar name={product.name} price={product.price} target={purchase} />}
    </div>
  );
}
