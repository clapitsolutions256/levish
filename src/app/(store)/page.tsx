import type { Metadata } from "next";
import Link from "next/link";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { Reels } from "@/components/Reels";
import { BlogCard } from "@/components/BlogCard";
import { ShopByStyle } from "@/components/ShopByStyle";
import { Spotlight } from "@/components/showcase/Spotlight";
import { StackedSections, type StackPanel } from "@/components/showcase/StackedSections";
import { OrbitShowcase } from "@/components/showcase/OrbitShowcase";
import { ShopTheLook } from "@/components/showcase/ShopTheLook";
import { buildLooks, orbitPieces, sectionPieces, wornBy } from "@/lib/showcase";
import type { Product } from "@/types";
import { isSold } from "@/lib/variants";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { AboutUs } from "@/components/AboutUs";
import { blogs } from "@/data/blogs";
import { getActiveProducts } from "@/lib/catalog";
import { JsonLd } from "@/components/JsonLd";
import { siteGraphJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import { styleCards } from "@/lib/styles";
import { PRODUCTS_PAUSED } from "@/lib/storeStatus";
import { ProductsPausedNotice } from "@/components/ComingSoon";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Original Fashion, Shoes & Accessories in Pakistan",
    description:
      "Shop original women's clothing, shoes, belts, caps and bags at Empulse. Nationwide delivery in Pakistan. Free shipping over Rs. 5,000.",
    path: "/",
  }),
  title: { absolute: "Empulse | Premium   By Origin" },
};

export default async function HomePage() {
  const catalog = await getActiveProducts();
  const newProducts = catalog.filter((product) => product.new);
  const saleProducts = catalog.filter((product) => product.salePercent);
  const styles = styleCards(catalog);
  const spotlight = catalog.find((product) => product.featured && !isSold(product)) ?? catalog[0];
  const pieces = (list: Product[]) => list.map(({ id, slug, name, image }) => ({ id, slug, name, image }));
  const panels: StackPanel[] = [
    {
      word: "Women",
      href: "/women",
      line: "Relaxed sweatshirts, wide-leg denim and everyday layers, all original.",
      count: catalog.filter(wornBy("women")).length,
      links: [
        { label: "Sweatshirts", href: "/sweatshirts?gender=women" },
        { label: "Trousers", href: "/trousers?gender=women" },
        { label: "Undergarments", href: "/undergarments?gender=women" },
      ],
      pieces: pieces(sectionPieces(catalog, wornBy("women"))),
      tone: "sage",
    },
    {
      word: "Men",
      href: "/men",
      line: "Jackets, hoodies and denim from Lacoste, Polo Ralph Lauren, Levi's and more.",
      count: catalog.filter(wornBy("men")).length,
      links: [
        { label: "Jackets", href: "/jackets?gender=men" },
        { label: "Hoodies", href: "/hoodies?gender=men" },
        { label: "Jeans", href: "/jeans?gender=men" },
      ],
      pieces: pieces(sectionPieces(catalog, wornBy("men"))),
      tone: "ink",
    },
    {
      word: "Shoes",
      href: "/shoes",
      line: "Sneakers and runners from On and the labels you know.",
      count: catalog.filter((product) => product.categoryId === "shoes").length,
      links: [
        { label: "Men's shoes", href: "/shoes?gender=men" },
        { label: "All shoes", href: "/shoes" },
      ],
      pieces: pieces(sectionPieces(catalog, (product) => product.categoryId === "shoes")),
      tone: "paper",
    },
  ];

  return (
    <div className="grain-overlay">
      <JsonLd data={siteGraphJsonLd()} />
      <HeroSlider />

      {spotlight ? (
        <Spotlight product={spotlight} pieceCount={catalog.length} />
      ) : (
        <section className="mx-auto max-w-[90rem] px-4 pt-10 sm:px-6 md:pt-14">
          <h1 className="section-heading">Original fashion, shoes and accessories</h1>
        </section>
      )}

      {PRODUCTS_PAUSED ? null : <StackedSections panels={panels} />}

      <ShopByStyle categories={styles} />

      {PRODUCTS_PAUSED ? (
        <section className="max-w-[90rem] mx-auto px-4 sm:px-6 pb-8">
          <ProductsPausedNotice />
        </section>
      ) : null}

      {saleProducts.length ? (
        <section className="max-w-[90rem] mx-auto px-4 sm:px-6 pt-4 pb-16 md:pb-20">
          <div className="mb-10 animate-fade-up">
            <p className="eyebrow mb-2">Limited time</p>
            <h2 className="section-heading">Sale</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7">
            {saleProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* New Arrivals */}
      <section className={`max-w-[90rem] mx-auto px-4 sm:px-6 pt-4 pb-16 md:pb-20 ${PRODUCTS_PAUSED ? "hidden" : ""}`}>
        <div className="flex items-end justify-between mb-10 animate-fade-up">
          <div>
            <p className="eyebrow mb-2">Just Dropped</p>
            <h2 className="section-heading">New Arrivals</h2>
          </div>
          <Link
            href="/women?filter=new"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200 flex items-center gap-1 group"
          >
            View all
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7">
          {newProducts.slice(0, 5).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {PRODUCTS_PAUSED ? null : <OrbitShowcase products={orbitPieces(catalog)} />}
      {PRODUCTS_PAUSED ? null : <ShopTheLook looks={buildLooks(catalog)} />}

      <div className="bg-[var(--background)]">
      <WhyChooseUs />
      <AboutUs />

      <Reels />

      <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 md:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">The journal</p>
            <h2 className="section-heading">Blogs</h2>
          </div>
          <Link
            href="/blog"
            className="group flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent-hover)]"
          >
            View all
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.slice(0, 3).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
