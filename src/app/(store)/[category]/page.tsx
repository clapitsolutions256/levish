import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandSections } from "@/components/BrandSections";
import { ComingSoon, whoLabel } from "@/components/ComingSoon";
import { GenderShopNav, type GenderShopType } from "@/components/GenderShopNav";
import {
  getActiveProducts,
  getBrandNamesForType,
  getProductsByCategory,
  getProductsByCategoryNew,
} from "@/lib/catalog";
import { categories } from "@/data/categories";
import type { Product } from "@/types";
import { MetaCatalogView } from "@/components/MetaPixel";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import { sameType } from "@/lib/productTypes";
import { productsOfType, typeLabel } from "@/lib/styles";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ filter?: string; type?: string; brand?: string }>;
};

const categorySlugs = categories.map((c) => c.slug);

const stylePages: Record<string, { heading: string; subcategory: string }> = {
  jackets: { heading: "Jackets", subcategory: "jacket" },
  jacket: { heading: "Jackets", subcategory: "jacket" },
  hoodies: { heading: "Hoodies", subcategory: "hoodie" },
  hoodie: { heading: "Hoodies", subcategory: "hoodie" },
  sweatshirts: { heading: "Sweatshirts", subcategory: "sweatshirt" },
  sweatshirt: { heading: "Sweatshirts", subcategory: "sweatshirt" },
  trousers: { heading: "Trousers", subcategory: "trouser" },
  trouser: { heading: "Trousers", subcategory: "trouser" },
  jeans: { heading: "Jeans", subcategory: "jeans" },
};

const apparelTypes: Record<string, { label: string; heading: string }> = {
  trouser: { label: "Trouser", heading: "Trousers" },
  sweatshirt: { label: "Sweatshirt", heading: "Sweatshirts" },
  jeans: { label: "Jeans", heading: "Jeans" },
  hoodie: { label: "Hoodie", heading: "Hoodies" },
  jacket: { label: "Jacket", heading: "Jackets" },
  undergarments: { label: "Undergarments", heading: "Undergarments" },
};

const styleCanonical: Record<string, string> = {
  jacket: "/jackets",
  hoodie: "/hoodies",
  trouser: "/trousers",
  sweatshirt: "/sweatshirts",
};

function categorySeo(categorySlug: string, filter?: string, type?: string) {
  const slug = categorySlug.toLowerCase();
  const style = stylePages[slug];
  if (style) {
    return {
      title: style.heading,
      description: `Shop original women's ${style.heading.toLowerCase()} at Empulse. Delivery across Pakistan and free shipping over Rs. 5,000.`,
      path: styleCanonical[slug] ?? `/${slug}`,
    };
  }
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;
  const gender = category.id === "women";
  const typeKey = type?.toLowerCase();
  const typeInfo = gender && typeKey ? apparelTypes[typeKey] : undefined;
  const isNew = filter === "new";
  const who = "Women";
  const title = isNew
    ? `New In – ${category.name}`
    : gender && typeInfo
      ? `${who}'s ${typeInfo.heading}`
      : gender
        ? who
        : category.name;
  const path = isNew ? `/${slug}?filter=new` : typeInfo && typeKey ? `/${slug}?type=${typeKey}` : `/${slug}`;
  return {
    title,
    description: `Shop ${title} at Empulse. Original clothing, shoes and accessories with delivery across Pakistan.`,
    path,
  };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const { filter, type } = await searchParams;
  const seo = categorySeo(categorySlug, filter, type);
  if (seo) return pageMeta(seo);
  const label = typeLabel(await getActiveProducts(), categorySlug);
  if (!label) return { title: "Shop" };
  return pageMeta({
    title: label,
    description: `Shop original women's ${label.toLowerCase()} at Empulse. Delivery across Pakistan and free shipping over Rs. 5,000.`,
    path: `/${categorySlug.toLowerCase()}`,
  });
}

// A type added in admin (e.g. "Shorts") that has no entry in apparelTypes.
async function customType(typeKey: string | undefined) {
  if (!typeKey || apparelTypes[typeKey]) return undefined;
  const label = typeLabel(await getActiveProducts(), typeKey);
  return label ? { label, heading: label } : undefined;
}

function StylePage({
  heading,
  path,
  category,
  list,
  upcoming,
  brand,
}: {
  heading: string;
  path: string;
  category: string;
  list: Product[];
  upcoming: string[];
  brand?: string;
}) {
  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10">
      <JsonLd data={collectionJsonLd({ name: heading, path, products: list })} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: heading, path }])} />
      <MetaCatalogView name={heading} category={category} ids={list.map((product) => product.id)} />
      <div className="mb-8 animate-fade-up">
        <h1 className="section-heading">{heading}</h1>
      </div>
      {list.length === 0 && !upcoming.length ? (
        <ComingSoon
          title={`${heading} are on their way`}
          text={`We're putting together a new range of women's ${heading.toLowerCase()}. Check back soon.`}
        />
      ) : (
        <BrandSections products={list} basePath={path} brand={brand} heading={heading} upcoming={upcoming} />
      )}
    </div>
  );
}

function forWomen(product: Product) {
  return product.categoryId === "women" || (product.categoryId === "shoes" && product.subcategory?.toLowerCase() === "woman");
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: categorySlug } = await params;
  const { filter, type, brand } = await searchParams;

  const slug = categorySlug.toLowerCase();
  const style = stylePages[slug];
  if (style) {
    const [products, upcoming] = await Promise.all([getActiveProducts(), getBrandNamesForType(style.subcategory)]);
    return (
      <StylePage
        heading={style.heading}
        path={styleCanonical[slug] ?? `/${slug}`}
        category={style.subcategory}
        list={products.filter((product) => sameType(product.subcategory, style.subcategory))}
        upcoming={upcoming}
        brand={brand}
      />
    );
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    // Any other type in use, e.g. /shorts for products typed "Shorts".
    const products = await getActiveProducts();
    const list = productsOfType(products, slug);
    if (!list.length) notFound();
    const label = typeLabel(products, slug);
    return (
      <StylePage
        heading={label}
        path={`/${slug}`}
        category={label.toLowerCase()}
        list={list}
        upcoming={await getBrandNamesForType(label)}
        brand={brand}
      />
    );
  }

  const gender = category.id === "women";
  const typeKey = type?.toLowerCase();
  const typeInfo = gender && typeKey ? apparelTypes[typeKey] ?? (await customType(typeKey)) : undefined;
  const isNewFilter = filter === "new";

  let list: Product[];
  if (gender && !isNewFilter) {
    const mine = (await getActiveProducts()).filter(forWomen);
    list = typeInfo
      ? mine.filter((product) => sameType(product.subcategory, typeInfo.label))
      : mine;
  } else {
    list = isNewFilter
      ? await getProductsByCategoryNew(category.id)
      : await getProductsByCategory(category.id);
  }

  const who = "Women";
  const heading = isNewFilter
    ? `New In – ${category.name}`
    : gender && typeInfo
      ? `${who}'s ${typeInfo.heading}`
      : gender
        ? who
        : category.name;

  const seo = categorySeo(categorySlug, filter, type);
  const upcoming = gender && typeInfo ? await getBrandNamesForType(typeInfo.label) : [];
  const thing = typeInfo ? typeInfo.heading.toLowerCase() : "styles";
  const emptyState = isNewFilter
    ? {
        title: "New arrivals are on their way",
        text: `We're adding fresh ${category.name.toLowerCase()} pieces. Check back soon.`,
      }
    : gender
      ? {
          title: `${whoLabel("women")} ${thing} are on their way`,
          text: `We're putting together a new range of women's ${thing}. Check back soon.`,
        }
      : whoLabel(category.id)
        ? {
            title: `${whoLabel(category.id)} styles are on their way`,
            text: `We're putting together a new range of ${whoLabel(category.id).toLowerCase()} clothing. Check back soon.`,
          }
        : {
            title: `${category.name} ${category.name.endsWith("s") ? "are on their way" : "is on its way"}`,
            text: `We're putting together a new range of ${category.name.toLowerCase()}. Check back soon.`,
          };
  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10">
      {seo ? (
        <>
          <JsonLd data={collectionJsonLd({ name: heading, path: seo.path, products: list })} />
          <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: heading, path: seo.path }])} />
        </>
      ) : null}
      <MetaCatalogView name={heading} category={category.id} ids={list.map((product) => product.id)} />
      <div className="mb-8 animate-fade-up">
        <h1 className="section-heading capitalize">
          {heading}
        </h1>
        {category.description && (
          <p className="type-copy mt-2 text-[var(--muted)]">{category.description}</p>
        )}
        {gender && (
          <GenderShopNav active={(typeInfo ? typeKey : "all") as GenderShopType} />
        )}
      </div>
      {list.length === 0 && !upcoming.length ? (
        <ComingSoon {...emptyState} />
      ) : (
        <BrandSections
          products={list}
          basePath={seo?.path ?? `/${category.slug}`}
          brand={brand}
          heading={typeInfo?.heading ?? category.name}
          upcoming={upcoming}
          empty={emptyState}
        />
      )}
    </div>
  );
}

export function generateStaticParams() {
  return categorySlugs.map((slug) => ({ category: slug }));
}
