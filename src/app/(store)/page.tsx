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
import { buildLooks, differentArticles, isLingerie, orbitPieces, sectionPieces, womenFirst, wornBy } from "@/lib/showcase";
import type { Product } from "@/types";
import { isSold } from "@/lib/variants";
import { onSale } from "@/lib/sale";
import { sameType } from "@/lib/productTypes";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { AboutUs } from "@/components/AboutUs";
import { Reviews } from "@/components/Reviews";
import { getAllReviews } from "@/lib/reviews";
import { blogs, HOME_POSTS } from "@/data/blogs";
import { getActiveProducts } from "@/lib/catalog";
import { JsonLd } from "@/components/JsonLd";
import { siteGraphJsonLd } from "@/lib/seo";
import { pageMeta, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { styleCards } from "@/lib/styles";
import { PRODUCTS_PAUSED } from "@/lib/storeStatus";
import { ProductsPausedNotice } from "@/components/ComingSoon";

export const metadata: Metadata = {
  ...pageMeta({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: SITE_TITLE },
};

export default async function HomePage() {
  // Women's pieces lead every section on the home page.
  const catalog = womenFirst(await getActiveProducts());
  const newProducts = catalog.filter((product) => product.new);
  const saleProducts = catalog.filter((product) => product.salePercent);
  const styles = styleCards(catalog);
  const spotlight =
    catalog.find((product) => product.slug === "gym-suit" && !isSold(product)) ??
    catalog.find((product) => product.featured && !isSold(product) && wornBy("women")(product)) ??
    catalog.find((product) => product.featured && !isSold(product)) ??
    catalog[0];
  // Reviews link to a product only while it is still in the shop.
  const reviews = await getAllReviews();
  const reviewedSlugs = new Set(reviews.map((review) => review.product ?? review.relatedProduct));
  const reviewedProducts = Object.fromEntries(
    catalog
      .filter((product) => reviewedSlugs.has(product.slug))
      .map((product) => [product.slug, { name: product.name, image: product.image }])
  );
  const pieces = (list: Product[]) => list.map(({ id, slug, name, image }) => ({ id, slug, name, image }));
  // These panels show clothing only: no lingerie photos anywhere in them.
  const isTee = (product: Product) => wornBy("women")(product) && sameType(product.subcategory, "Polos & Tees");
  // Tees have their own panel, so the Women panel shows the rest of the clothing.
  const clothing = (product: Product) => wornBy("women")(product) && !isLingerie(product) && !isTee(product);
  const panels: StackPanel[] = [
    {
      word: "Women",
      href: "/women",
      line: "Relaxed sweatshirts, wide-leg denim and everyday layers, all original.",
      count: catalog.filter(clothing).length,
      links: [
        { label: "Sweatshirts", href: "/sweatshirts?gender=women" },
        { label: "Trousers", href: "/trousers?gender=women" },
        { label: "Co-ord sets", href: "/co-ord-sets" },
      ],
      pieces: pieces(sectionPieces(catalog, clothing)),
      tone: "sage",
    },
    {
      word: "Tees",
      href: "/polos-and-tees",
      line: "Soft cotton tees in easy colours, made to wear every day.",
      count: catalog.filter(isTee).length,
      links: [
        { label: "Polos & Tees", href: "/polos-and-tees" },
        { label: "New in", href: "/women?filter=new" },
      ],
      pieces: pieces(sectionPieces(catalog, isTee)),
      tone: "ink",
    },
    {
      word: "Sale",
      href: "/sale",
      line: "Original pieces at lower prices, while stock lasts.",
      count: catalog.filter(onSale).length,
      links: [
        { label: "New in", href: "/women?filter=new" },
        { label: "Deals", href: "/deals" },
      ],
      pieces: pieces(sectionPieces(catalog, (product) => onSale(product) && !isLingerie(product))),
      tone: "paper",
    },
  ].filter((panel) => panel.count > 0) as StackPanel[];

  return (
    <div className="grain-overlay">
      <JsonLd data={siteGraphJsonLd()} />
      <HeroSlider />

      <ShopByStyle categories={styles} />

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
          {/* Six fill whole rows of two or three; tablets show four and desktops five. */}
          {differentArticles(newProducts, 6).map((product, i) => (
            <div key={product.id} className={i === 4 ? "md:max-lg:hidden" : i === 5 ? "md:hidden" : undefined}>
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </section>

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

      {spotlight ? (
        <Spotlight product={spotlight} />
      ) : (
        <section className="mx-auto max-w-[90rem] px-4 pt-10 sm:px-6 md:pt-14">
          <h1 className="section-heading">Bras, lingerie and women&apos;s fashion in Pakistan</h1>
        </section>
      )}

      {PRODUCTS_PAUSED ? null : <StackedSections panels={panels} />}

      {PRODUCTS_PAUSED ? (
        <section className="max-w-[90rem] mx-auto px-4 sm:px-6 pb-8">
          <ProductsPausedNotice />
        </section>
      ) : null}

      {PRODUCTS_PAUSED ? null : <OrbitShowcase products={orbitPieces(catalog)} />}
      {PRODUCTS_PAUSED ? null : <ShopTheLook looks={buildLooks(catalog)} />}

      <div className="bg-[var(--background)]">
      <WhyChooseUs />
      <Reviews reviews={reviews} products={reviewedProducts} shop={catalog.map(({ slug, name }) => ({ slug, name }))} />
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
          {HOME_POSTS.flatMap((slug) => blogs.filter((post) => post.slug === slug)).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
