"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { ComingSoon } from "@/components/ComingSoon";
import { articleKey } from "@/lib/showcase";
import { galleryFor } from "@/lib/variants";

function ArticleCard({ products, index }: { products: Product[]; index: number }) {
  const options = products.flatMap((product) => {
    const variantColors = (product.variants ?? []).map((variant) => variant.color);
    const colors = [...new Set((variantColors.length ? variantColors : [
      product.color,
      ...(product.colorImages ?? []).map((gallery) => gallery.color),
    ]).filter((color) => color && color !== "—"))];
    return colors.length ? colors.map((color) => ({ product, color })) : [{ product, color: "" }];
  });
  const [selected, setSelected] = useState(0);
  const { product, color } = options[selected] ?? options[0];
  const images = galleryFor(product, color);
  const shown: Product = {
    ...product,
    color: color || product.color,
    image: images[0] || product.image,
    images: images.length ? images : product.images,
    variants: product.variants?.filter((variant) => !color || variant.color === color),
  };

  return (
    <div className="flex h-full flex-col">
      <ProductCard key={`${product.id}-${color}`} product={shown} index={index} priority={index < 4} />
      <div aria-label={`Colors for ${product.name}`} className="mt-3 flex flex-wrap gap-2">
        {options.map((option, optionIndex) => (
          <button
            key={`${option.product.id}-${option.color}`}
            type="button"
            aria-pressed={selected === optionIndex}
            onClick={() => setSelected(optionIndex)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${selected === optionIndex ? "clay-ink" : "clay text-[var(--foreground)]"}`}
          >
            {option.color || "Original"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DealProductList({ products, heading }: { products: Product[]; heading: string }) {
  const articles = new Map<string, Product[]>();
  for (const product of products) {
    const key = `${product.categoryId}|${articleKey(product)}`;
    const group = articles.get(key) ?? [];
    group.push(product);
    articles.set(key, group);
  }

  if (!products.length) return <ComingSoon title={`${heading} are on their way`} text={`We're putting together a new range of ${heading.toLowerCase()}. Check back soon.`} />;

  return (
    <>
      <p className="mb-6 text-sm text-[var(--muted)]">{articles.size} article{articles.size === 1 ? "" : "s"}</p>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[...articles.entries()].map(([key, group], index) => <ArticleCard key={key} products={group} index={index} />)}
      </div>
    </>
  );
}
