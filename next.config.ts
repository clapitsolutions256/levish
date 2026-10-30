import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "localhost";

// Each clothing type has one page with a Women / Men filter, so the old per-gender URLs point there.
const typePages: Record<string, string> = {
  trouser: "/trousers",
  sweatshirt: "/sweatshirts",
  jeans: "/jeans",
  hoodie: "/hoodies",
  jacket: "/jackets",
  undergarments: "/undergarments",
};

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      ...["women", "men"].flatMap((gender) =>
        Object.entries(typePages).map(([type, page]) => ({
          source: `/${gender}`,
          has: [{ type: "query" as const, key: "type", value: type }],
          destination: `${page}?gender=${gender}`,
          permanent: true,
        }))
      ),
      { source: "/shoes/:gender(women|men)", destination: "/shoes?gender=:gender", permanent: true },
    ];
  },
  // This project sits inside another Next.js project; keep builds rooted here.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    // Product and banner uploads get new file names, so optimised copies can be kept for a month.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
