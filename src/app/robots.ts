import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/cart",
        "/checkout",
        "/account",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/order/",
        "/search",
        "/coming-soon",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
