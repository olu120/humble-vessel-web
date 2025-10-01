// app/sitemap.ts
const SITE = "https://humblevesselfoundationandclinic.org";

const routes = ["", "/about", "/volunteer", "/donate"]; // keep simple & solid

export default function sitemap() {
  const now = new Date();
  const locales: ("en" | "lg")[] = ["en", "lg"];
  return locales.flatMap((loc) =>
    routes.map((r) => ({
      url: `${SITE}/${loc}${r}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: r === "" ? 1.0 : 0.8,
      alternates: {
        languages: {
          en: `${SITE}/en${r}`,
          lg: `${SITE}/lg${r}`,
        },
      },
    }))
  );
}
