import Link from "next/link";
import Image from "next/image";
import { formatBlogDate, type BlogPost } from "@/data/blogs";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-[#f4e6ec]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <p className="eyebrow mt-4">{post.category}</p>
      <h3 className="section-heading mt-2 text-[var(--foreground)] group-hover:text-[#4a142a]">
        {post.title}
      </h3>
      <p className="type-copy mt-2 line-clamp-3 text-[var(--muted)]">{post.excerpt}</p>
      <p className="mt-auto pt-3 text-xs text-[var(--muted)]">{formatBlogDate(post.date)}</p>
    </Link>
  );
}
