import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: isStaticExport ? "/CODE-SPLASH" : undefined,
  assetPrefix: isStaticExport ? "/CODE-SPLASH/" : undefined,
  images: {
    unoptimized: isStaticExport,
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
