import type { Product } from "@/types";
import { assets } from "@/data/assets";
import { contact } from "@/data/contact";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

const FREE_SHIPPING_FROM = 5000;
const SHIPPING_FEE = 300;

const CATEGORY_LABELS: Record<string, string> = { men: "Men", women: "Women", unisex: "Unisex", shoes: "Shoes" };

/** "Men" for men, "Shoes" for shoes, and so on, for breadcrumbs and structured data. */
export function categoryLabel(categoryId: string) {
  return CATEGORY_LABELS[categoryId] ?? categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}

/** Plain-text summary of an admin-written description (drops bullets, markdown and extra spaces). */
export function plainDescription(text: string | undefined, max = 160) {
  const clean = (text ?? "").replace(/[*#_>`]+/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/** Search snippet for a product: what it is, its price, then the store promise. */
export function productSummary(product: Product) {
  const brand = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) ? ` by ${product.brand}` : "";
  const color = product.color && product.color !== "—" ? ` in ${product.color}` : "";
  return `${product.name.replace(/\.$/, "")}${brand}${color}, Rs. ${product.price.toLocaleString()}. 100% original, check before you pay, delivery across Pakistan.`;
}

const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "PK",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
};

function shippingDetails(price: number) {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: price >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE, currency: "PKR" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
    },
  };
}

export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: "Empulse",
        url: SITE_URL,
        logo: absoluteUrl(assets.logo),
        email: contact.email,
        telephone: contact.phone,
        address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
        hasMerchantReturnPolicy: returnPolicy,
        sameAs: [contact.facebook, contact.instagram],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: contact.phone,
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
        image: absoluteUrl("/og.png?v=5"),
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
  const description = plainDescription(product.description, 5000) || productSummary(product);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name.replace(/\.$/, ""),
    sku: product.id,
    image: productImages(product),
    description,
    color: product.color && product.color !== "—" ? product.color : undefined,
    category: [categoryLabel(product.categoryId), product.subcategory].filter(Boolean).join(" > "),
    brand: { "@type": "Brand", name: product.brand?.trim() || SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "PKR",
      price: String(product.price),
      availability: productInStock(product) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
      shippingDetails: shippingDetails(product.price),
      hasMerchantReturnPolicy: returnPolicy,
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
