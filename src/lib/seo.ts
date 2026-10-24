import type { Product } from "@/types";
import { assets } from "@/data/assets";
import { contact } from "@/data/contact";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl(assets.logo),
        email: contact.email,
        sameAs: [contact.facebook, contact.instagram],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+923224036100",
          contactType: "customer service",
          areaServed: "PK",
          availableLanguage: ["English", "Urdu"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "OnlineStore",
        "@id": `${SITE_URL}/#store`,
        name: SITE_NAME,
        url: SITE_URL,
        image: absoluteUrl("/og.png"),
        currenciesAccepted: "PKR",
        paymentAccepted: "Cash, Credit Card",
        areaServed: "PK",
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionJsonLd(input: {
  name: string;
  path: string;
  products: Product[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    url: absoluteUrl(input.path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.products.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: absoluteUrl(`/product/${product.slug}`),
      })),
    },
  };
}

function productImages(product: Product) {
  const images = product.images?.length ? product.images : [product.image];
  return images.filter(Boolean).map((image) => absoluteUrl(image));
}

function productInStock(product: Product) {
  if (!product.variants?.length) return true;
  return product.variants.some((variant) => variant.stock > 0);
}

export function productJsonLd(product: Product) {
  const description =
    product.description?.trim() ||
    `${product.name}${product.color ? ` in ${product.color}` : ""}. Shop original fashion at Empulse with delivery across Pakistan.`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.id,
    image: productImages(product),
    description,
    color: product.color || undefined,
    category: product.categoryId,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "PKR",
      price: String(product.price),
      availability: productInStock(product) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function articleJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: absoluteUrl(post.image),
    articleSection: post.category,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
