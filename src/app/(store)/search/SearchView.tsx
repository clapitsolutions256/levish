"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import type { Product } from "@/types";
import { catalogApi, useGetProductsQuery } from "@/store/catalogApi";
import type { AppDispatch } from "@/store/store";
import { trackSearch } from "@/lib/metaPixel";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

export function SearchView({
  initialProducts,
  initialQuery = "",
}: {
  initialProducts: Product[];
  initialQuery?: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState(initialQuery);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dispatch(catalogApi.util.upsertQueryData("getProducts", undefined, initialProducts));
    setReady(true);
  }, [dispatch, initialProducts]);

  const { data } = useGetProductsQuery(undefined, {
    skip: !ready,
    refetchOnMountOrArgChange: 120,
  });
  const products = data ?? initialProducts;
  const q = query.trim().toLowerCase();
  const genderType: Record<string, string> = {
    trouser: "trouser",
    sweatshirt: "sweatshirt",
    jeans: "jeans",
    hoodie: "hoodie",
    jacket: "jacket",
  };
  const splitType = genderType[q];
  const results =
    q.length > 0
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(q) ||
            product.color.toLowerCase().includes(q) ||
            (product.brand?.toLowerCase().includes(q) ?? false) ||
            product.categoryId.includes(q) ||
            (product.subcategory?.toLowerCase().includes(q) ?? false)
        )
      : [];

  const resultIds = results.map((product) => product.id).join(",");

  useEffect(() => {
    const queryText = query.trim();
    if (queryText.length < 2) return;
    const timer = window.setTimeout(() => {
      trackSearch(queryText, resultIds ? resultIds.split(",") : []);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [query, resultIds]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-heading mb-6">Search</h1>
      <input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        autoFocus
      />
      {splitType && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/women?type=${splitType}`} className="rounded-full bg-[#4a142a] px-5 py-2 text-sm font-medium text-white hover:bg-[#350e1e]">
            Shop all {splitType === "jeans" ? "jeans" : `${splitType}s`}
          </Link>
        </div>
      )}
      {query && (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </p>
      )}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
        {results.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} className="group flex h-full flex-col">
            <div className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-xl bg-[var(--cream)]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
            <p className="mt-2 h-5 truncate text-sm text-[var(--muted)]">{product.color}</p>
            <p className="h-12 overflow-hidden font-medium leading-6 line-clamp-2 group-hover:text-[var(--accent)]">
              {product.name}
            </p>
            <p className="mt-auto pt-1 text-sm font-medium">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>
      {query && results.length === 0 && (
        <p className="type-copy py-12 text-center text-[var(--muted)]">
          No products found for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
