// app/[locale]/page.tsx
import Image from "next/image";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Button from "@/components/Button";
import { getPosts, getServices, getApprovedReviews } from "@/lib/wp";
import { getDictionary } from "@/lib/i18n";
import ImpactStrip from "@/components/ImpactStrip";
import PartnersStrip from "@/components/PartnersStrip";

// NEW: motion hero
import HeroMotion from "@/components/HeroMotion";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Humble Vessel Foundation & Clinic",
  url: "https://humblevesselfoundationandclinic.org",
  logo: "https://humblevesselfoundationandclinic.org/icon.svg",
  sameAs: [],
  address: {
    "@type": "PostalAddress",
    addressCountry: "UG",
  },
};

export default async function HomePage({
  params,
}: { params: { locale: string } }) {
  const raw = params.locale;
  const locale = raw === "lg" ? "lg" : "en";

  const dict = await getDictionary(locale);
  const [posts, services, reviews] = await Promise.all([
    getPosts(),
    getServices(),
    getApprovedReviews(),
  ]);
  const featured = services?.filter((s: any) => s?.acf?.is_featured);

  // Slides for the motion hero — use local files for best perf.
  // Put these under /public/images/ (hero-1.jpg, hero-2.jpg, hero-3.jpg).
  const slides = [
    {
      img: "/images/hero-1.jpg",
      title:
        locale === "lg"
          ? "Obuweereza obw’obulamu obwesigika, obwekikadde ku bantu"
          : "Trustworthy healthcare, rooted in community",
      subtitle:
        locale === "lg"
          ? "Tuzimba obulamu n’obwenkanya mu Mityana n’awalala."
          : "We’re building health and justice across Mityana and beyond.",
      ctas: [
        { label: dict.hero.donate, href: `/${params.locale}/donate` },
        { label: dict.hero.volunteer, href: `/${params.locale}/volunteer`, variant: "secondary" as const },
      ],
      focal: { x: 0.5, y: 0.4 },
    },
    {
      img: "/images/hero-2.jpg",
      title:
        locale === "lg"
          ? "Okutuuka eri bonna: mu kabuga, ewaabwe, mu masomero"
          : "Care that reaches everyone: towns, homes, schools",
      subtitle:
        locale === "lg"
          ? "Ebikozesebwa eby’omulembe n’ettutumu ly’abasawo baffe."
          : "Modern tools and a caring clinical team.",
      ctas: [
        { label: locale === "lg" ? "Laba ebyo bye tukola" : "See our services", href: `/${params.locale}/#services`, variant: "secondary" as const },
      ],
      focal: { x: 0.55, y: 0.35 },
    },
    {
      img: "/images/hero-3.jpg",
      title:
        locale === "lg"
          ? "Okuwa abazuukufu essuubi n’obuwanguzi"
          : "Restoring hope and restoring lives",
      subtitle:
        locale === "lg"
          ? "Buli ssente entono etwala omusono mungi."
          : "Every contribution counts.",
      ctas: [{ label: locale === "lg" ? "Guza obulamu" : "Give now", href: `/${params.locale}/donate` }],
      focal: { x: 0.5, y: 0.5 },
    },
  ];

  return (
    <main>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* NEW: Motion hero with slides */}
      <HeroMotion slides={slides} locale={locale} />

      {/* FEATURED SERVICES — anchor for hero CTA */}
      <Section id="services" title={dict.sections.services} bg="alt">
        <ul className="grid gap-6 md:grid-cols-3">
          {featured?.map((s: any) => (
            <li key={s.id} className="p-5 bg-white rounded-2xl shadow-card">
              <div className="flex items-center gap-3 mb-2">
                {s.acf?.icon && (
                  // Keep <img> for now to avoid remote domain config issues.
                  <img
                    src={s.acf.icon}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <h3
                  className="text-lg font-medium"
                  dangerouslySetInnerHTML={{ __html: s.title?.rendered }}
                />
              </div>
              <p className="text-sm opacity-80">{s.acf?.summary}</p>
            </li>
          ))}
          {!featured?.length && <p className="opacity-70">No featured services yet.</p>}
        </ul>
      </Section>

      {/* LATEST STORIES */}
      <Section title={dict.sections.stories}>
        <ul className="grid gap-6 md:grid-cols-2">
          {posts?.map((p: any) => (
            <li key={p.id} className="p-5 bg-white rounded-2xl shadow-card">
              <h3
                className="mb-2 text-xl font-medium"
                dangerouslySetInnerHTML={{ __html: p.title.rendered }}
              />
              <a
                className="inline-block mt-2 underline text-brand-blue"
                href={`/${params.locale}/stories/${p.slug}`}
              >
                Read more
              </a>
            </li>
          ))}
          {!posts?.length && <p className="opacity-70">No stories yet.</p>}
        </ul>
      </Section>

      {/* REVIEWS */}
      <Section title={dict.sections.reviews} bg="alt">
        <ul className="grid gap-6 md:grid-cols-2">
          {reviews?.map((r: any) => (
            <li key={r.id} className="p-5 bg-white rounded-2xl shadow-card">
              <div className="flex items-center gap-2 mb-1">
                <strong>{r.acf?.reviewer_name || "Anonymous"}</strong>
                <span className="text-sm opacity-70">• {r.acf?.rating}/5</span>
              </div>
              <p className="text-sm opacity-90">{r.acf?.comment}</p>
            </li>
          ))}
          {!reviews?.length && <p className="opacity-70">No reviews yet.</p>}
        </ul>
      </Section>
      <ImpactStrip />
      <PartnersStrip />
    </main>
  );
}
