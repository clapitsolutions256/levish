import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { getActiveProducts } from "@/lib/catalog";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import { isSold } from "@/lib/variants";
import { onSale, saleLeadFirst } from "@/lib/sale";

export const metadata = pageMeta({
  title: "Sale",
  description: "Women's clothing and lingerie on sale at Levish. Cash on delivery across Pakistan.",
  path: "/sale",
});

export default async function SalePage() {
  const all = (await getActiveProducts()).filter(onSale);
  // The sale lead first, then pieces you can still buy, sold-out ones after.
  const products = saleLeadFirst([...all.filter((product) => !isSold(product)), ...all.filter(isSold)]);

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
      <JsonLd data={collectionJsonLd({ name: "Sale", path: "/sale", products })} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Sale", path: "/sale" }])} />
      <div className="mb-10">
        <p className="eyebrow mb-2">Limited time</p>
        <h1 className="section-heading">Sale</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{products.length} products on sale</p>
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-7 lg:grid-cols-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">Nothing on sale right now. Check back soon.</p>
      )}
    </div>
  );
}
