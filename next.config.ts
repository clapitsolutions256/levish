import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "localhost";

const nextConfig: NextConfig = {
  devIndicators: false,
  // This project sits inside another Next.js project; keep builds rooted here.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  images: {
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
