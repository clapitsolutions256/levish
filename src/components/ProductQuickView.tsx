"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { trackViewContent } from "@/lib/metaPixel";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { ProductPurchase } from "@/components/ProductPurchase";
import { SwipeGallery } from "@/components/SwipeGallery";
import { galleryFor, isSold, uniqueValues } from "@/lib/variants";
import { SoldBadge } from "@/components/SoldBadge";
import { SaleTag } from "@/components/SaleTag";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

function backgroundFromImage(image: HTMLImageElement) {
  if (!image.naturalWidth) return "";
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "";
  try {
    context.drawImage(image, 0, 0, 16, 16, 0, 0, 4, 4);
    const { data } = context.getImageData(0, 0, 4, 4);
    let red = 0;
    let green = 0;
    let blue = 0;
    const count = data.length / 4;
    for (let index = 0; index < data.length; index += 4) {
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
    }
    return `rgb(${Math.round(red / count)}, ${Math.round(green / count)}, ${Math.round(blue / count)})`;
  } catch {
    return "";
  }
}

export function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const titleId = useId();
  const [color, setColor] = useState(uniqueValues(product.variants ?? [], "color")[0] ?? "");
  const photos = galleryFor(product, color);
  const [active, setActive] = useState(0);
  const onColorChange = useCallback((next: string) => {
    setColor((currentColor) => {
      if (currentColor !== next) setActive(0);
      return next;
    });
  }, []);
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      onClose();
      return;
    }
    setClosing(true);
    window.setTimeout(onClose, 220);
  }, [onClose]);

  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => {
    trackViewContent({
      id: product.id,
      name: product.name,
      category: product.categoryId,
      price: product.price,
    });
  }, [product.id, product.name, product.categoryId, product.price]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 pb-[4.75rem] md:p-6">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 ${closing ? "quick-view-backdrop-out" : "quick-view-backdrop"}`}
        aria-label="Close product details"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 grid max-h-[calc(100dvh-6.25rem)] w-full max-w-6xl grid-cols-1 grid-rows-[auto_auto] overflow-y-auto rounded-2xl bg-white shadow-[0_24px_80px_rgba(11,11,11,0.18)] [scrollbar-width:none] md:h-[min(780px,90dvh)] md:max-h-none md:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] md:grid-rows-1 md:overflow-hidden md:rounded-[1.6rem] [&::-webkit-scrollbar]:hidden ${
          closing ? "quick-view-panel-out" : "quick-view-panel"
        }`}
      >
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--accent)] transition hover:bg-[var(--sage-tint)] md:top-4 md:right-4"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="flex shrink-0 flex-col md:h-full md:min-h-0" style={{ backgroundColor: frameColor }}>
          <SwipeGallery
            photos={photos}
            active={active}
            onIndex={setActive}
            alt={product.name}
            imageClassName="object-contain p-2 md:p-10"
            sizes="(max-width: 768px) 100vw, 56vw"
            className="h-[340px] md:h-auto md:min-h-0 md:flex-1"
            onLoad={(image) => {
              const next = backgroundFromImage(image);
              if (next) setFrameColor(next);
            }}
          >
            {product.new ? (
              <span className="pointer-events-none absolute top-4 left-4 z-10 rounded-full bg-[var(--sage-tint)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                New
              </span>
            ) : null}
            {product.salePercent ? <SaleTag percent={product.salePercent} large /> : null}
            {isSold(product) ? <SoldBadge large /> : null}
          </SwipeGallery>
          {photos.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:px-5 md:pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {photos.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border md:h-14 md:w-14 md:rounded-xl ${
                    index === active ? "border-[var(--accent)]" : "border-black/10"
                  }`}
                  style={{ backgroundColor: frameColor }}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === active}
                >
                  <Image src={photo} alt="" fill className="object-contain p-1" sizes="56px" loading="eager" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-col px-5 pt-4 md:h-full md:px-8 md:py-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
            {[product.subcategory, product.categoryId].filter(Boolean).join(" · ")}
          </p>
          <h2 id={titleId} className="section-heading mt-1.5 text-[var(--foreground)]">
            {product.name}
          </h2>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="text-2xl font-semibold text-[var(--accent)]">{formatPrice(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-sm text-[var(--muted)] line-through">{formatPrice(product.compareAtPrice)}</p>
            ) : null}
            {product.salePercent ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-semibold text-red-600">{product.salePercent}% off</span>
            ) : null}
          </div>
          {product.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)] md:line-clamp-none">{product.description}</p>
          ) : null}

          <div className="mt-3 shrink-0 border-t border-black/10 bg-white pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:mt-auto md:pb-0">
            <ProductPurchase compact product={product} onAdded={requestClose} onColorChange={onColorChange} />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--muted)]">Free shipping above Rs. 5,000</p>
              <Link href={`/product/${product.slug}`} className="shrink-0 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                View full details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
