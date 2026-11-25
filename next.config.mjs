import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Plain JavaScript, so the config loads even where Next's native compiler can't run (Hostinger's
// build servers fall back to the WebAssembly compiler, which can't load a TypeScript config).
const projectRoot = dirname(fileURLToPath(import.meta.url));

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "localhost";

// Each clothing type has one page with a Women / Men filter, so the old per-gender URLs point there.
/** @type {Record<string, string>} */
const typePages = {
  trouser: "/trousers",
  sweatshirt: "/sweatshirts",
  jeans: "/jeans",
  hoodie: "/hoodies",
  jacket: "/jackets",
  undergarments: "/undergarments",
};

/** @type {import("next").NextConfig} */
const nextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      ...["women", "men"].flatMap((gender) =>
        Object.entries(typePages).map(([type, page]) => ({
          source: `/${gender}`,
          has: [{ type: /** @type {const} */ ("query"), key: "type", value: type }],
          destination: `${page}?gender=${gender}`,
          permanent: true,
        }))
      ),
      { source: "/shoes/:gender(women|men)", destination: "/shoes?gender=:gender", permanent: true },
      // The shoe post went when shoes left the shop.
      { source: "/blog/the-shoe-that-finishes-the-outfit", destination: "/blog", permanent: true },
      // Bodysuits and co-ord sets are listed under Lingerie now.
      { source: "/:style(bodysuits|bodysuit|co-ord-sets|co-ord-set)", destination: "/undergarments", permanent: true },
      // One-colour products merged into one product with colour options. Most old links redirect on the
      // product page (slug + "-" + colour); these old slugs don't follow that pattern.
      ...[
        ["white-croppsy-sweatshirt", "oversized-croppsy-sweatshirt", "White"],
        ["brown-croppsy-sweatshirt", "oversized-croppsy-sweatshirt", "Brown"],
        ["dark-green-croppsy-sweatshirt", "oversized-croppsy-sweatshirt", "Green"],
        ["lacoste-paris-embossed-sweatshirt-stone", "lacoste-paris-embossed-sweatshirt", "Sand Gray"],
        ["trouser-croppsy-dark-green", "trouser-croppsy", "Green"],
        ["the-overrun-co-women-s-t-shirt-blue", "the-overrun-co-women-s-t-shirt", "Pastel Blue"],
      ].map(([from, to, color]) => ({
        source: `/product/${from}`,
        destination: `/product/${to}?color=${encodeURIComponent(color)}`,
        permanent: true,
      })),
    ];
  },
  // This project sits inside another Next.js project; keep builds rooted here.
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    // Fewer widths than Next's default sixteen: every image tag lists them all, and the home page has over a hundred.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [48, 96, 128, 256, 384],
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
