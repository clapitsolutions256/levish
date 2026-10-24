import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getActiveProducts, getProductBySlug, slugify } from "@/lib/catalog";
import { PRODUCTS_PAUSED } from "@/lib/storeStatus";
import { ProductsPausedNotice } from "@/components/ComingSoon";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import { ProductDetail } from "./ProductDetail";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ color?: string }> };

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const description =
    product.description?.trim() ||
    `${product.name}${product.color ? ` in ${product.color}` : ""}. Shop original ${product.categoryId} at Empulse with delivery across Pakistan.`;
  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
  return {
    ...pageMeta({
      title: product.name,
      description: description.slice(0, 160),
      path: `/product/${product.slug}`,
    }),
    openGraph: {
      title: product.name,
      description: description.slice(0, 160),
      url: `/product/${product.slug}`,
      type: "website",
      images: images.slice(0, 4).map((url) => ({ url, alt: product.name })),
    },
  };
}

// Old one-colour links (e.g. /product/zara-relaxed-fit-trouser-black) point at products
// that are now a single product with colour options.
async function findMergedProduct(slug: string) {
  const products = await getActiveProducts();
  return products
    .filter((item) => slug.startsWith(`${item.slug}-`))
    .map((item) => {
      const rest = slug.slice(item.slug.length + 1);
      const color = (item.variants ?? []).map((variant) => variant.color).find((value) => slugify(value) === rest);
      return color ? { product: item, color } : null;
    })
    .find(Boolean);
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { color } = await searchParams;
  if (PRODUCTS_PAUSED) {
    return (
      <div className="mx-auto max-w-[100rem] px-4 py-8 sm:px-6 lg:px-10">
        <ProductsPausedNotice />
      </div>
    );
  }
  const product = await getProductBySlug(slug);
  if (!product) {
    const merged = await findMergedProduct(slug);
    if (merged) permanentRedirect(`/product/${merged.product.slug}?color=${encodeURIComponent(merged.color)}`);
    notFound();
  }

  const related = (await getActiveProducts())
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-8 sm:px-6 lg:px-10">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: product.categoryId, path: `/${product.categoryId}` },
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--accent)]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/${product.categoryId}`}
          className="hover:text-[var(--accent)] capitalize"
        >
          {product.categoryId}
        </Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </nav>

      <ProductDetail product={product} initialColor={color} />

      {related.length > 0 && (
        <section className="mt-20 pt-16 border-t border-[var(--border)]">
          <h2 className="section-heading mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group flex h-full flex-col"
              >
                <div className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-xl bg-[var(--cream)]">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-contain"
                    sizes="25vw"
                  />
                </div>
                <p className="mt-2 h-5 truncate text-sm text-[var(--muted)]">{p.color}</p>
                <p className="h-12 overflow-hidden font-medium leading-6 line-clamp-2 group-hover:text-[var(--accent)]">
                  {p.name}
                </p>
                <p className="mt-auto pt-1 text-sm font-medium">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((product) => ({ slug: product.slug }));
}
