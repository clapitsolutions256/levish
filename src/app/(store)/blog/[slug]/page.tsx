import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogs, formatBlogDate, getBlog } from "@/data/blogs";
import { JsonLd } from "@/components/JsonLd";
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
  return {
    ...pageMeta({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
    }),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.image, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) notFound();
  const more = blogs.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blogs", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <p className="text-sm text-[var(--muted)]">
        <Link href="/blog" className="hover:text-[#4a142a]">
          Blogs
        </Link>
        <span className="mx-2">/</span>
        <span>{post.category}</span>
      </p>
      <h1 className="section-heading mt-4">{post.title}</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">{formatBlogDate(post.date)}</p>
      <div className="relative mt-8 aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-[#f4e6ec] sm:aspect-[5/4]">
        <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
      </div>
      <div className="type-copy mt-8 space-y-5 text-[var(--foreground)]">
        {post.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {more.length > 0 && (
        <div className="mt-14 border-t border-[var(--border)] pt-8">
          <h2 className="section-heading">More from the journal</h2>
          <ul className="mt-4 space-y-3">
            {more.map((item) => (
              <li key={item.slug}>
                <Link href={`/blog/${item.slug}`} className="text-[#4a142a] hover:underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
