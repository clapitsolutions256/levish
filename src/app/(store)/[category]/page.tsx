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

function categorySeo(categorySlug: string, filter?: string) {
  const slug = categorySlug.toLowerCase();
  const style = stylePages[slug];
  if (style) {
    return {
      title: style.heading,
      description: `Shop original ${style.heading.toLowerCase()} at Empulse. Delivery across Pakistan and free shipping over Rs. 5,000.`,
      path: styleCanonical[slug] ?? `/${slug}`,
    };
  }
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;
  const gender = isGender(category.id) ? category.id : null;
  const isNew = filter === "new";
  const title = isNew ? `New In – ${category.name}` : gender ? genderInfo[gender].who : category.name;
  const path = isNew ? `/${slug}?filter=new` : `/${slug}`;
  return {
    title,
    description: `Shop ${title} at Empulse. Original clothing, shoes and accessories with delivery across Pakistan.`,
    path,
  };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const { filter } = await searchParams;
  const seo = categorySeo(categorySlug, filter);
  if (seo) return pageMeta(seo);
  const label = typeLabel(await getActiveProducts(), categorySlug);
  if (!label) return { title: "Shop" };
  return pageMeta({
    title: label,
    description: `Shop original ${label.toLowerCase()} at Empulse. Delivery across Pakistan and free shipping over Rs. 5,000.`,
    path: `/${categorySlug.toLowerCase()}`,
  });
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
