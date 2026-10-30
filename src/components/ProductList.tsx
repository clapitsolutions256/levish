import type { ComponentProps } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ComingSoon } from "@/components/ComingSoon";
import type { Product } from "@/types";

/** Product count and grid for a listing page, or a coming-soon note when it is empty. */
export function ProductList({
  products,
  heading,
  empty,
}: {
  products: Product[];
  heading: string;
  empty?: ComponentProps<typeof ComingSoon>;
}) {
  if (products.length === 0) {
    return (
      <ComingSoon
        title={`${heading} are on their way`}
        text={`We're putting together a new range of ${heading.toLowerCase()}. Check back soon.`}
        {...empty}
      />
    );
  }
  return (
    <>
      <p className="text-sm text-[var(--muted)] mb-6">
        {products.length} product{products.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </>
  );
}
