import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cms/", "/api/", "/_next/", "/frames/", "/register/school/", "/register/university/"],
      },
    ],
    sitemap: "https://codesplash.cssa.lk/sitemap",
  };
}
