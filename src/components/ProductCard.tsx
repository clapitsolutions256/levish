"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { flyProductToCart } from "@/lib/flyToCart";
import { ProductQuickView } from "@/components/ProductQuickView";
import { findVariant, galleryFor, isSold, uniqueValues } from "@/lib/variants";
import { SoldBadge } from "@/components/SoldBadge";
import { SaleTag } from "@/components/SaleTag";
import { trackAddToCart } from "@/lib/metaPixel";

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

interface ProductCardProps {
  product: Product;
  index?: number;
  /** First cards on a listing: fetch the photo straight away. */
  priority?: boolean;
}

const HOLD_DELAY = 220;
const PHOTO_INTERVAL = 1200;
const MOVE_TOLERANCE = 10;

// Press and hold on touch screens (or hover with a mouse) to flip through a product's photos.
// Extra photos only load once someone starts interacting with the card.
function usePhotoPreview(count: number) {
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loop = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  const clearTimers = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (loop.current) clearInterval(loop.current);
    holdTimer.current = null;
    loop.current = null;
  }, []);

  const play = useCallback(() => {
    if (count < 2) return;
    setArmed(true);
    setPlaying(true);
    setActive(1);
    loop.current = setInterval(() => setActive((current) => (current + 1) % count), PHOTO_INTERVAL);
  }, [count]);

  const stop = useCallback(() => {
    clearTimers();
    setPlaying(false);
    setActive(0);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const handlers = {
    onTouchStart(event: React.TouchEvent) {
      if (count < 2 || event.touches.length > 1) return;
      if ((event.target as HTMLElement).closest("button")) return;
      const touch = event.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
      suppressClick.current = false;
      setArmed(true);
      clearTimers();
      holdTimer.current = setTimeout(() => {
        suppressClick.current = true;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
        play();
      }, HOLD_DELAY);
    },
    onTouchMove(event: React.TouchEvent) {
      const origin = touchStart.current;
      const touch = event.touches[0];
      if (!origin || !touch) return;
      if (Math.abs(touch.clientX - origin.x) > MOVE_TOLERANCE || Math.abs(touch.clientY - origin.y) > MOVE_TOLERANCE) {
        touchStart.current = null;
        stop();
      }
    },
    onTouchEnd() {
      touchStart.current = null;
      stop();
    },
    onContextMenu(event: React.MouseEvent) {
      if (suppressClick.current || playing) event.preventDefault();
    },
    onPointerEnter(event: React.PointerEvent) {
      if (event.pointerType !== "mouse") return;
      clearTimers();
      play();
    },
    onPointerLeave(event: React.PointerEvent) {
      if (event.pointerType !== "mouse") return;
      stop();
    },
  };

  // A hold that showed photos should not also open the product when the finger lifts.
  function consumeClick(event: React.MouseEvent) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
  }

  return { active, armed, playing, handlers, consumeClick };
}

function CardActions({
  product,
  onAdd,
  onView,
  soldOut,
}: {
  product: Product;
  onAdd: (event: { currentTarget: HTMLElement }) => void;
  onView: () => void;
  soldOut: boolean;
}) {
  const button =
    "flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-90 sm:h-9 sm:w-9";
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`View ${product.name}`}
        onClick={onView}
        className={`${button} clay text-[var(--accent)]`}
      >
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.6" strokeWidth={1.6} />
        </svg>
      </button>
      <button
        type="button"
        aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        onClick={onAdd}
        disabled={soldOut}
        data-quick-add
        className={`${button} skeuo-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100`}
      >
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </button>
    </div>
  );
}

// The cart button on sized products: pick a size (and colour) right on the card, then it is added.
function QuickSizePicker({
  product,
  onPick,
  onClose,
}: {
  product: Product;
  onPick: (size: string, color: string) => void;
  onClose: () => void;
}) {
  const { items } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const variants = product.variants ?? [];
  const colors = uniqueValues(variants, "color");
  const [color, setColor] = useState(() => variants.find((variant) => variant.stock > 0)?.color ?? colors[0] ?? "");
  const sizes = uniqueValues(variants.filter((variant) => !color || variant.color === color), "size");
  // A size can be added while the bag holds fewer than the stock left.
  const canAdd = (size: string) => {
    const stock = findVariant(variants, size, color)?.stock ?? 0;
    const inBag = items.find((item) => item.product.id === product.id && (item.size ?? "") === size && (item.color ?? "") === color)?.quantity ?? 0;
    return stock > 0 && inBag < stock;
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      // The card's cart button toggles the picker itself.
      if (!ref.current?.contains(target) && !target.closest("[data-quick-add]")) onClose();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} role="dialog" aria-label={`Choose a size for ${product.name}`} className="glass-solid animate-fade-up absolute inset-x-2 bottom-2 z-30 rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Choose size</p>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {colors.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {colors.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setColor(item)}
              aria-pressed={item === color}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${item === color ? "clay-ink" : "clay text-[var(--foreground)]/80"}`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {sizes.map((size) => {
          const available = canAdd(size);
          return (
            <button
              key={size}
              type="button"
              disabled={!available}
              onClick={() => onPick(size, color)}
              aria-label={available ? `Add size ${size}` : `${size}, unavailable`}
              className={`min-w-10 rounded-xl px-2.5 py-2 text-sm font-semibold transition active:scale-95 ${
                available ? "skeuo text-[var(--foreground)] hover:bg-[var(--sage-tint)]" : "cursor-not-allowed bg-black/5 text-[var(--muted)]/60 line-through"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);
  const frameRef = useRef<HTMLDivElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const [frameColor, setFrameColor] = useState("#e4e4e4");
  const delayClasses = [
    "",
    "animation-delay-100",
    "animation-delay-200",
    "animation-delay-300",
    "animation-delay-400",
    "animation-delay-500",
  ];
  const delayClass = delayClasses[Math.min(index, 5)] ?? "animation-delay-500";
  const tracked = Boolean(product.variants?.length);
  const soldOut = isSold(product);
  const firstColor = product.variants?.find((variant) => variant.color)?.color;
  const photos = [...new Set([product.image, ...galleryFor(product, firstColor)].filter(Boolean))].slice(0, 6);
  const preview = usePhotoPreview(photos.length);

  function addLine(size: string | undefined, color: string | undefined, from: HTMLElement | null) {
    addToCart(product, 1, size, color);
    trackAddToCart({ id: product.id, name: product.name, category: product.categoryId, price: product.price });
    const photo = frameRef.current ?? from;
    if (photo) flyProductToCart(photo, (color ? galleryFor(product, color)[0] : "") || product.image);
  }

  const matchFrame = useCallback((image: HTMLImageElement) => {
    setImageReady(true);
    const next = backgroundFromImage(image);
    if (next) setFrameColor(next);
  }, []);

  useEffect(() => {
    const image = frameRef.current?.querySelector("img");
    if (image?.complete && image.naturalWidth > 0) matchFrame(image);
  }, [matchFrame, product.image]);

  return (
    <article className={`group flex h-full flex-col animate-fade-up ${delayClass}`}>
      <div
        ref={frameRef}
        className="relative aspect-[3/4] select-none overflow-hidden rounded-[1.7rem] shadow-[0_14px_34px_rgba(11,11,11,0.08)] transition-[transform,box-shadow] duration-300 group-hover:shadow-[0_20px_44px_rgba(11,11,11,0.14)] active:scale-[0.985] [-webkit-touch-callout:none]"
        style={{ backgroundColor: frameColor }}
        {...preview.handlers}
      >
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0"
          aria-label={product.name}
          draggable={false}
          onClick={preview.consumeClick}
        >
          {!imageReady ? <div className="skeleton absolute inset-0 z-10" aria-hidden /> : null}
          {photos.map((photo, photoIndex) =>
            photoIndex === 0 || preview.armed ? (
              <Image
                key={photo}
                src={photo}
                alt={photoIndex === 0 ? product.name : ""}
                fill
                draggable={false}
                loading={priority && photoIndex === 0 ? "eager" : "lazy"}
                fetchPriority={priority && photoIndex === 0 ? "high" : "auto"}
                className={`object-contain will-change-[opacity,transform] [transition:opacity_800ms_cubic-bezier(0.4,0,0.2,1),transform_1600ms_cubic-bezier(0.25,0.1,0.25,1)] ${
                  preview.active === photoIndex ? "opacity-100" : "opacity-0"
                } ${preview.playing && preview.active === photoIndex ? "motion-safe:scale-[1.025]" : "scale-100"}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onLoad={photoIndex === 0 ? (event) => matchFrame(event.currentTarget) : undefined}
              />
            ) : null
          )}
        </Link>
        {product.new && (
          <span className="clay-sage absolute top-3 left-3 z-20 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
            New
          </span>
        )}
        {product.salePercent ? <SaleTag percent={product.salePercent} /> : null}
        {soldOut ? <SoldBadge /> : null}
        {pickerOpen ? (
          <QuickSizePicker
            product={product}
            onClose={closePicker}
            onPick={(size, color) => {
              addLine(size, color, frameRef.current);
              setPickerOpen(false);
            }}
          />
        ) : null}
        <div className="absolute bottom-3 right-3 z-20">
          <CardActions
            product={product}
            onAdd={(event) => {
              if (tracked) {
                // One size left to buy: add it straight away; otherwise ask which size.
                const open = (product.variants ?? []).filter((variant) => variant.stock > 0);
                const only = open.length === 1 ? open[0] : null;
                const inBag = only
                  ? items.find((item) => item.product.id === product.id && item.size === only.size && item.color === only.color)?.quantity ?? 0
                  : 0;
                if (only && inBag < only.stock) addLine(only.size, only.color, event.currentTarget);
                else setPickerOpen((value) => !value);
                return;
              }
              addLine(undefined, undefined, event.currentTarget);
            }}
            onView={() => setDetailsOpen(true)}
            soldOut={soldOut}
          />
        </div>
      </div>
      {detailsOpen ? <ProductQuickView product={product} onClose={closeDetails} /> : null}
      <Link href={`/product/${product.slug}`} className="mt-3 flex flex-1 flex-col">
        <span className="inline-flex w-fit max-w-full truncate rounded-full bg-[var(--sage-tint)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--sage-deep)]">
          {product.color}
        </span>
        {product.brand ? (
          <span className="mt-2 block truncate text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">
            {product.brand}
          </span>
        ) : null}
        <h3 className={`${product.brand ? "mt-0.5" : "mt-2"} h-10 overflow-hidden text-[15px] font-medium leading-5 text-[var(--foreground)] line-clamp-2 transition-colors duration-200 group-hover:text-[var(--accent)]`}>
          {product.name}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[15px] font-semibold text-[var(--accent)]">
          {formatPrice(product.price)}
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <>
              <span className="text-[13px] font-normal text-[var(--muted)] line-through">{formatPrice(product.compareAtPrice)}</span>
              <span className="text-[12px] font-semibold text-red-600">
                {product.salePercent || Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
              </span>
            </>
          ) : null}
        </p>
      </Link>
    </article>
  );
}
