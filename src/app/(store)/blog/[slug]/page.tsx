import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogs, blogWordCount, formatBlogDate, getBlog, headingId } from "@/data/blogs";
import { BlogCard } from "@/components/BlogCard";
import { JsonLd } from "@/components/JsonLd";
import { getActiveProducts } from "@/lib/catalog";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogs.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) return { title: "Blog" };
  const meta = pageMeta({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}` });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      section: post.category,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: { ...meta.twitter, images: [post.image] },
  };
}

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) notFound();
  const catalog = await getActiveProducts().catch(() => []);
  const featured = post.products.flatMap((productSlug) => catalog.filter((product) => product.slug === productSlug));
  const more = blogs.filter((item) => item.slug !== post.slug).slice(0, 3);
  const minutes = Math.max(1, Math.round(blogWordCount(post) / 200));

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <JsonLd data={articleJsonLd(post, blogWordCount(post))} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blogs", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
        <Link href="/blog" className="hover:text-[var(--accent)]">
          Blogs
        </Link>
        <span className="mx-2">/</span>
        <span>{post.category}</span>
      </nav>
      <h1 className="section-heading mt-4">{post.title}</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
        {post.updated && post.updated !== post.date ? (
          <>
            {" · Updated "}
            <time dateTime={post.updated}>{formatBlogDate(post.updated)}</time>
          </>
        ) : null}
        {` · ${minutes} min read`}
      </p>
      <div className="relative mt-8 aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-[var(--sage-tint)] sm:aspect-[5/4]">
        <Image src={post.image} alt={post.imageAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
      </div>

      <div className="type-copy mt-8 space-y-5 text-[var(--foreground)]">
        {post.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {post.sections.length >= 3 ? (
        <nav aria-label="In this post" className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">In this post</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {post.sections.map((section) => (
              <li key={section.heading}>
                <a href={`#${headingId(section.heading)}`} className="text-[var(--accent)] hover:underline">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {post.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 id={headingId(section.heading)} className="scroll-mt-28 text-xl font-semibold text-[var(--foreground)] md:text-2xl">
            {section.heading}
          </h2>
          <div className="type-copy mt-4 space-y-4 text-[var(--foreground)]">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.points?.length ? (
              <ul className="list-disc space-y-2 pl-5 marker:text-[var(--accent)]">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      {featured.length > 0 && (
        <section className="mt-14 border-t border-[var(--border)] pt-10" aria-label="Shop this post">
          <h2 className="section-heading">Shop this post</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {featured.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--cream)]">
                  <Image src={product.image} alt={product.name} fill className="object-contain" sizes="(max-width: 640px) 50vw, 240px" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug group-hover:text-[var(--accent)]">{product.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="mt-14 border-t border-[var(--border)] pt-10" aria-label="More from the journal">
          <h2 className="section-heading">More from the journal</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {more.map((item) => (
              <BlogCard key={item.slug} post={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
