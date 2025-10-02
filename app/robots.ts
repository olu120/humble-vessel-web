// app/robots.ts
import type { MetadataRoute } from "next";

const SITE = "https://humblevesselfoundationandclinic.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/en", "/lg", "/_next/static/", "/_next/image/"],
        disallow: [
          "/admin",
          "/en/admin",
          "/lg/admin",
          "/api",
          "/private",
          "/draft",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
