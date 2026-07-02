import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_STATIC_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: process.env.NEXT_STATIC_EXPORT === "true",
  },
};

export default nextConfig;
