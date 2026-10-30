import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ProductList } from "@/components/ProductList";
import { ComingSoon, whoLabel } from "@/components/ComingSoon";
import { getProductsByCategoryAndSubcategory } from "@/lib/catalog";
import { categories } from "@/data/categories";
import { MetaCatalogView } from "@/components/MetaPixel";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

type Props = {
  params: Promise<{ category: string; subcategory: string }>;
};

const categorySlugs = ["women", "shoes", "accessories"] as const;

const subcategoryTitles: Record<string, Record<string, string>> = {
  women: {
    tops: "Tops & Blouses",
    dresses: "Dresses & Jumpsuits",
    tshirts: "T-Shirts",
    bottoms: "Bottoms",
    blazers: "Blazers",
    sweaters: "Sweaters & Cardigans",
    jackets: "Jackets & Coats",
  },
  shoes: {
    women: "Women's Shoes",
    men: "Men's Shoes",
  },
  accessories: {
    eyewear: "Eyewear",
  },
};

const validSubcategories: Record<string, string[]> = {
  women: ["tops", "dresses", "tshirts", "bottoms", "blazers", "sweaters", "jackets"],
  shoes: ["women", "men"],
  accessories: ["eyewear"],
};

function subcategoryTitle(cat: string, sub: string) {
  return subcategoryTitles[cat]?.[sub] ?? sub.charAt(0).toUpperCase() + sub.slice(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const cat = categorySlug.toLowerCase();
  const sub = subcategorySlug.toLowerCase();
  if (!categorySlugs.includes(cat as (typeof categorySlugs)[number])) return { title: "Shop" };
  if (!validSubcategories[cat]?.includes(sub)) return { title: "Shop" };
  const category = categories.find((item) => item.slug === cat);
  const title = subcategoryTitle(cat, sub);
  const meta = pageMeta({
    title,
    description: `Shop original ${title.toLowerCase()} at Levish. Check before you pay, delivery across Pakistan and free shipping over Rs. 5,000.`,
    path: `/${cat}/${sub}`,
  });
  // Empty listings stay out of the index until they have products.
  const stocked = category ? (await getProductsByCategoryAndSubcategory(category.id, sub)).length > 0 : false;
  return stocked ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function SubcategoryPage({ params }: Props) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const cat = categorySlug.toLowerCase();
  const sub = subcategorySlug.toLowerCase();

  if (!categorySlugs.includes(cat as (typeof categorySlugs)[number])) notFound();
  const allowed = validSubcategories[cat];
  if (!allowed || !allowed.includes(sub)) notFound();

  const category = categories.find((c) => c.slug === cat);
  if (!category) notFound();

  // Men's and women's shoes are a filter on /shoes now.
  if (cat === "shoes" && (sub === "women" || sub === "men")) redirect(`/shoes?gender=${sub}`);
  const title = subcategoryTitle(cat, sub);

  const list = await getProductsByCategoryAndSubcategory(category.id, sub);
  const shoeWho = cat === "shoes" ? whoLabel(sub) : "";
  const emptyState = shoeWho
    ? {
        title: `${shoeWho} shoes are on their way`,
        text: `We're putting together a new range of ${sub === "men" ? "men's" : "women's"} sneakers, sandals and more. Check back soon.`,
      }
    : {
        title: `${whoLabel(cat)} ${title.toLowerCase()} ${title.endsWith("s") ? "are on their way" : "is on its way"}`.trim(),
        text: `We're putting together a new range of ${title.toLowerCase()}. Check back soon.`,
        href: `/${cat}`,
        cta: whoLabel(cat) ? `Shop ${whoLabel(cat)} Collection` : `Shop all ${category.name}`,
      };

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10">
      <JsonLd data={collectionJsonLd({ name: title, path: `/${cat}/${sub}`, products: list })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: category.name, path: `/${cat}` },
          { name: title, path: `/${cat}/${sub}` },
        ])}
      />
      <MetaCatalogView name={title} category={category.id} ids={list.map((product) => product.id)} />
      <div className="mb-8 animate-fade-up">
        <nav className="text-sm text-[var(--muted)] mb-1">
          <Link href="/" className="hover:text-[var(--accent)]">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link href={`/${cat}`} className="hover:text-[var(--accent)]">
            {category.name}
          </Link>
          <span className="mx-1">/</span>
          <span className="text-[var(--foreground)]">{title}</span>
        </nav>
        <h1 className="section-heading">
          {title}
        </h1>
        {category.description && (
          <p className="type-copy mt-2 text-[var(--muted)]">{category.description}</p>
        )}
      </div>
      {list.length === 0 ? (
        <ComingSoon {...emptyState} />
      ) : (
        <ProductList products={list} heading={title} />
      )}
    </div>
  );
}

export function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = [];
  for (const [cat, subs] of Object.entries(validSubcategories)) {
    for (const sub of subs) {
      params.push({ category: cat, subcategory: sub });
    }
  }
  return params;
}
