import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductList } from "@/components/ProductList";
import { ComingSoon, whoLabel } from "@/components/ComingSoon";
import { GenderFilter, GenderShopNav } from "@/components/GenderShopNav";
import { getActiveProducts, getProductsByCategory, getProductsByCategoryNew } from "@/lib/catalog";
import { categories, type Gender } from "@/data/categories";
import type { Product } from "@/types";
import { MetaCatalogView } from "@/components/MetaPixel";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import { sameType } from "@/lib/productTypes";
import { productsOfType, typeLabel, typePath } from "@/lib/styles";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ filter?: string; type?: string; gender?: string }>;
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

const styleCanonical: Record<string, string> = {
  jacket: "/jackets",
  hoodie: "/hoodies",
  trouser: "/trousers",
  sweatshirt: "/sweatshirts",
};

const genderInfo: Record<Gender, { who: string; shoes: string }> = {
  women: { who: "Women", shoes: "woman" },
  men: { who: "Men", shoes: "men" },
};

function isGender(id: string | undefined): id is Gender {
  return id === "women" || id === "men";
}

// Unisex pieces belong to both ranges.
function forGender(product: Product, gender: Gender) {
  return (
    product.categoryId === gender ||
    product.categoryId === "unisex" ||
    (product.categoryId === "shoes" && product.subcategory?.toLowerCase() === genderInfo[gender].shoes)
  );
}

// "Lacoste, Polo Ralph Lauren and Levis" from the brands most stocked in a list.
function brandLine(list: Product[]) {
  const counts = new Map<string, number>();
  for (const product of list) {
    const brand = product.brand?.trim();
    if (brand) counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([brand]) => brand);
  if (top.length < 2) return top[0] ?? "";
  return `${top.slice(0, -1).join(", ")} and ${top[top.length - 1]}`;
}

const PROMISE = "Check before you pay. Free shipping over Rs. 5,000 across Pakistan.";

function listingMeta(input: { title: string; lead: string; path: string; list: Product[] }) {
  const brands = brandLine(input.list);
  const meta = pageMeta({
    title: input.title,
    description: `${input.lead}${brands ? ` from ${brands}` : ""} at Levish. ${PROMISE}`,
    path: input.path,
  });
  // Empty listings stay out of the index until they have products.
  return input.list.length ? meta : { ...meta, robots: { index: false, follow: true } };
}

const possessive = (gender: Gender) => (gender === "men" ? "men's" : "women's");

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const { filter, gender: genderParam } = await searchParams;
  const slug = categorySlug.toLowerCase();
  const genderFilter = isGender(genderParam) ? genderParam : null;
  const products = await getActiveProducts();
  const style = stylePages[slug];

  // Type pages, with or without the Women / Men filter.
  if (style || !categories.some((item) => item.slug === slug)) {
    const base = style ? styleCanonical[slug] ?? `/${slug}` : `/${slug}`;
    const heading = style?.heading ?? typeLabel(products, slug);
    if (!heading) return { title: "Shop" };
    const all = style ? products.filter((product) => sameType(product.subcategory, style.subcategory)) : productsOfType(products, slug);
    const list = genderFilter ? all.filter((product) => forGender(product, genderFilter)) : all;
    return listingMeta({
      title: genderFilter ? `${genderInfo[genderFilter].who}'s ${heading} in Pakistan` : `${heading} for Men & Women in Pakistan`,
      lead: `Shop original ${genderFilter ? `${possessive(genderFilter)} ` : ""}${heading.toLowerCase()}`,
      path: genderFilter ? `${base}?gender=${genderFilter}` : base,
      list,
    });
  }

  const category = categories.find((item) => item.slug === slug)!;
  const gender = isGender(category.id) ? category.id : null;
  if (filter === "new") {
    const list = products.filter((product) => (gender ? forGender(product, gender) : product.categoryId === category.id) && product.new);
    return listingMeta({
      title: gender ? `New In for ${genderInfo[gender].who}` : `New In – ${category.name}`,
      lead: `The latest ${gender ? possessive(gender) : category.name.toLowerCase()} arrivals`,
      path: `/${slug}?filter=new`,
      list,
    });
  }
  if (gender) {
    return listingMeta({
      title: gender === "men" ? "Men's Clothing & Sneakers in Pakistan" : "Women's Clothing & Shoes in Pakistan",
      lead: `Shop original ${possessive(gender)} clothing and ${gender === "men" ? "sneakers" : "shoes"}`,
      path: `/${slug}`,
      list: products.filter((product) => forGender(product, gender)),
    });
  }
  if (category.id === "shoes") {
    const all = products.filter((product) => product.categoryId === "shoes");
    const list = genderFilter ? all.filter((product) => product.subcategory?.toLowerCase() === genderInfo[genderFilter].shoes) : all;
    return listingMeta({
      title: genderFilter ? `${genderInfo[genderFilter].who}'s Shoes & Sneakers in Pakistan` : "Shoes & Sneakers in Pakistan",
      lead: `Shop original ${genderFilter ? `${possessive(genderFilter)} ` : ""}shoes and sneakers`,
      path: genderFilter ? `/shoes?gender=${genderFilter}` : "/shoes",
      list,
    });
  }
  return listingMeta({
    title: `${category.name} in Pakistan`,
    lead: `Shop original ${category.name.toLowerCase()}`,
    path: `/${slug}`,
    list: products.filter((product) => product.categoryId === category.id),
  });
}

// Canonical path and heading for a listing's structured data.
function categorySeo(categorySlug: string, filter?: string) {
  const slug = categorySlug.toLowerCase();
  const style = stylePages[slug];
  if (style) return { title: style.heading, path: styleCanonical[slug] ?? `/${slug}` };
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;
  const gender = isGender(category.id) ? category.id : null;
  const isNew = filter === "new";
  const title = isNew ? `New In – ${category.name}` : gender ? genderInfo[gender].who : category.name;
  return { title, path: isNew ? `/${slug}?filter=new` : `/${slug}` };
}

// One page per type (e.g. /sweatshirts) with Women / Men as a filter on the page.
function StylePage({
  heading,
  path,
  category,
  list,
  gender,
}: {
  heading: string;
  path: string;
  category: string;
  list: Product[];
  gender: Gender | null;
}) {
  const shown = gender ? list.filter((product) => forGender(product, gender)) : list;
  const title = gender ? `${genderInfo[gender].who}'s ${heading}` : heading;
  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10">
      <JsonLd data={collectionJsonLd({ name: heading, path, products: list })} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: heading, path }])} />
      <MetaCatalogView name={title} category={category} ids={shown.map((product) => product.id)} />
      <div className="mb-8 animate-fade-up">
        <h1 className="section-heading">{title}</h1>
        <GenderFilter path={path} active={gender} />
      </div>
      <ProductList
        products={shown}
        heading={title}
        empty={
          gender
            ? {
                title: `${title} are on their way`,
                text: `We're putting together a new range of ${title.toLowerCase()}. Check back soon.`,
                href: path,
                cta: `Shop all ${heading.toLowerCase()}`,
              }
            : undefined
        }
      />
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: categorySlug } = await params;
  const { filter, type, gender: genderParam } = await searchParams;
  const genderFilter = isGender(genderParam) ? genderParam : null;

  const slug = categorySlug.toLowerCase();
  const style = stylePages[slug];
  if (style) {
    const products = await getActiveProducts();
    return (
      <StylePage
        heading={style.heading}
        path={styleCanonical[slug] ?? `/${slug}`}
        category={style.subcategory}
        list={products.filter((product) => sameType(product.subcategory, style.subcategory))}
        gender={genderFilter}
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
    return <StylePage heading={label} path={`/${slug}`} category={label.toLowerCase()} list={list} gender={genderFilter} />;
  }

  const gender = isGender(category.id) ? category.id : null;
  // Old links such as /women?type=sweatshirt now open the type page with the filter set.
  const typeKey = type?.toLowerCase();
  if (gender && typeKey) redirect(`${typePath(typeKey)}?gender=${gender}`);

  const isNewFilter = filter === "new";
  const isShoes = category.id === "shoes";

  let list: Product[];
  if (gender && !isNewFilter) {
    list = (await getActiveProducts()).filter((product) => forGender(product, gender));
  } else {
    list = isNewFilter
      ? await getProductsByCategoryNew(category.id)
      : await getProductsByCategory(category.id);
  }
  if (isShoes && genderFilter) {
    list = list.filter((product) => product.subcategory?.toLowerCase() === genderInfo[genderFilter].shoes);
  }

  const heading = isNewFilter
    ? `New In – ${category.name}`
    : gender
      ? genderInfo[gender].who
      : isShoes && genderFilter
        ? `${genderInfo[genderFilter].who}'s Shoes`
        : category.name;

  const seo = categorySeo(categorySlug, filter);
  const emptyState = isNewFilter
    ? {
        title: "New arrivals are on their way",
        text: `We're adding fresh ${category.name.toLowerCase()} pieces. Check back soon.`,
      }
    : gender
      ? {
          title: `${whoLabel(gender)} styles are on their way`,
          text: `We're putting together a new range of ${genderInfo[gender].who.toLowerCase()}'s clothing. Check back soon.`,
        }
      : {
          title: `${heading} ${heading.endsWith("s") ? "are on their way" : "is on its way"}`,
          text: `We're putting together a new range of ${heading.toLowerCase()}. Check back soon.`,
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
        {category.description && !isShoes && (
          <p className="type-copy mt-2 text-[var(--muted)]">{category.description}</p>
        )}
        {gender && <GenderShopNav gender={gender} active="all" />}
        {isShoes && !isNewFilter && <GenderFilter path="/shoes" active={genderFilter} />}
      </div>
      {list.length === 0 ? (
        <ComingSoon {...emptyState} />
      ) : (
        <ProductList products={list} heading={heading} empty={emptyState} />
      )}
    </div>
  );
}

export function generateStaticParams() {
  return categorySlugs.map((slug) => ({ category: slug }));
}
