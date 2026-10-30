import type { Metadata } from "next";

export const SITE_URL = "https://www.empulse.store";
export const SITE_NAME = "Empulse";

export const SITE_DESCRIPTION =
  "Shop original women's clothing, shoes, belts, caps and bags at Empulse. Nationwide delivery in Pakistan. Free shipping over Rs. 5,000.";

// Link preview for shared pages. Page metadata replaces the root openGraph object, so pages repeat it.
export const SHARE_IMAGE = {
  url: "/og.png?v=5",
  width: 1200,
  height: 630,
  alt: "Levish – original fashion, shoes and accessories",
};

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}

export function privateMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    ...pageMeta({ title, description, path }),
    robots: { index: false, follow: false },
  };
}
