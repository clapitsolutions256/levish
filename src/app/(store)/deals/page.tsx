import Link from "next/link";
import { DealProductList } from "@/components/DealProductList";
import { JsonLd } from "@/components/JsonLd";
import { MetaCatalogView } from "@/components/MetaPixel";
import { getActiveProducts } from "@/lib/catalog";
import { dealProducts, dealStyles } from "@/lib/deals";
import { sameType } from "@/lib/productTypes";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Deals",
  description: "Explore all trousers, jackets and sweatshirts at Levish.",
  path: "/deals",
});

export default async function DealsPage() {
  const products = dealProducts(await getActiveProducts());

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
      <JsonLd data={collectionJsonLd({ name: "Deals", path: "/deals", products })} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Deals", path: "/deals" }])} />
      <MetaCatalogView name="Deals" category="deals" ids={products.map((product) => product.id)} />
      <div className="mb-10">
        <p className="eyebrow mb-2">Explore</p>
        <h1 className="section-heading">Deals</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Shop all trousers, jackets and sweatshirts.</p>
        <nav aria-label="Deal categories" className="mt-6 flex flex-wrap gap-3">
          {dealStyles.map((style) => (
            <a key={style.slug} href={`#${style.slug}`} className="clay rounded-full px-4 py-2 text-sm font-medium text-[var(--accent)]">
              {style.name}
            </a>
          ))}
        </nav>
        <p className="mt-5 text-sm text-[var(--muted)]">{products.length} products across {dealStyles.length} styles</p>
      </div>
      <div className="space-y-14">
        {dealStyles.map((style) => (
          <section key={style.slug} id={style.slug} aria-labelledby={`${style.slug}-heading`} className="scroll-mt-32">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 id={`${style.slug}-heading`} className="section-heading">{style.name}</h2>
              <Link href={`/${style.slug}`} className="text-sm font-medium text-[var(--accent)]">Shop {style.name} →</Link>
            </div>
            <DealProductList products={products.filter((product) => sameType(product.subcategory, style.type))} heading={style.name} />
          </section>
        ))}
      </div>
    </div>
  );
}
