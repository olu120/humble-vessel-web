// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE = "https://humblevesselfoundationandclinic.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const alternates = (pathEn: string, pathLg: string) => ({
    languages: {
      "en-US": `${SITE}${pathEn}`,
      lg: `${SITE}${pathLg}`,
    },
  });

  const urls: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/en`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1,
      alternates: alternates("/en", "/lg"),
    },
    {
      url: `${SITE}/lg`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: alternates("/en", "/lg"),
    },
    // Key pages present in both locales
    ...["donate", "volunteer", "about"].flatMap((slug) => [
      {
        url: `${SITE}/en/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: alternates(`/en/${slug}`, `/lg/${slug}`),
      },
      {
        url: `${SITE}/lg/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: alternates(`/en/${slug}`, `/lg/${slug}`),
      },
    ]),
  ];

  return urls;
}
