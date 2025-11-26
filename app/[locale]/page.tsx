// app/[locale]/page.tsx
import Container from "@/components/Container";
import Section from "@/components/Section";
import { getPosts, getServices, getApprovedReviews } from "@/lib/wp";
import { getDictionary } from "@/lib/i18n";

import ImpactStrip from "@/components/ImpactStrip";
import PartnersStrip from "@/components/PartnersStrip";
import TransparencyBand from "@/components/TransparencyBand";
import HeroMotion from "@/components/HeroMotion";
import FeaturedPrograms from "@/components/FeaturedPrograms";
import OurStory from "@/components/OurStory";
import TestimonialsSection from "@/components/TestimonialsSection";
import MissionVision from "@/components/MissionVision";
import GiveCTA from "@/components/GiveCTA";
import DonationPopup from "@/components/DonationPopup";
import GoogleReviewsEmbed from "@/components/GoogleReviewsEmbed";

// --- helpers for posts ---
function stripHtml(html: string) {
  return html ? html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
}
function truncate(s: string, n = 160) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function getPostImage(p: any): string | null {
  // 1) _embed featured media (preferred)
  const em = p?._embedded?.["wp:featuredmedia"]?.[0];
  if (em?.media_details?.sizes) {
    // pick a reasonable size if available
    const sizes = em.media_details.sizes;
    const pick =
      sizes.medium_large?.source_url ||
      sizes.large?.source_url ||
      sizes.medium?.source_url ||
      em.source_url;
    if (pick) return pick;
  }
  if (em?.source_url) return em.source_url;

  // 2) Jetpack field or Yoast OG fallback
  if (p?.jetpack_featured_media_url) return p.jetpack_featured_media_url;
  if (p?.yoast_head_json?.og_image?.[0]?.url) return p.yoast_head_json.og_image[0].url;

  // 3) Custom ACF (if you added one)
  if (p?.acf?.image) return p.acf.image;

  return null;
}

type StoryCard = {
  id: number | string;
  slug: string;
  titleHtml: string;
  img: string | null;
  excerpt: string;
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Humble Vessel Foundation & Clinic",
  url: "https://humblevesselfoundationandclinic.org",
  logo: "https://humblevesselfoundationandclinic.org/icon.svg",
  sameAs: [],
  address: { "@type": "PostalAddress", addressCountry: "UG" },
};

export default async function HomePage({ params }: { params: { locale: string } }) {
  const raw = params.locale;
  const locale = raw === "lg" ? "lg" : "en";
  const dict = await getDictionary(locale);

  const [posts, services, reviews] = await Promise.all([
    getPosts(),
    getServices(),
    getApprovedReviews(),
  ]);


// Prefer featured image via _embed, otherwise use first <img> in content, else ACF/Yoast/Jetpack fields
function extractPostImage(p: any): string | null {
  // 1) Embedded featured image
  const em = p?._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = em?.media_details?.sizes;
  if (sizes) {
    return (
      sizes.medium_large?.source_url ||
      sizes.large?.source_url ||
      sizes.medium?.source_url ||
      em?.source_url ||
      null
    );
  }
  if (em?.source_url) return em.source_url;

  // 2) First <img> in post content (if author pasted an image in the body)
  const html = p?.content?.rendered || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m?.[1]) return m[1];

  // 3) Other common fields
  if (p?.jetpack_featured_media_url) return p.jetpack_featured_media_url;
  if (p?.yoast_head_json?.og_image?.[0]?.url) return p.yoast_head_json.og_image[0].url;
  if (p?.acf?.image) return p.acf.image;

  return null;
}


  // --- HERO SLIDES (local images) ---
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
      ctas: [{ label: locale === "lg" ? "Laba ebyo bye tukola" : "See our services", href: `/${params.locale}/#services`, variant: "secondary" as const }],
      focal: { x: 0.55, y: 0.35 },
    },
    {
      img: "/images/hero-3.jpg",
      title: locale === "lg" ? "Okuwa abazuukufu essuubi n’obuwanguzi" : "Restoring hope and restoring lives",
      subtitle: locale === "lg" ? "Buli ssente entono etwala omusono mungi." : "Every contribution counts.",
      ctas: [{ label: locale === "lg" ? "Guza obulamu" : "Give now", href: `/${params.locale}/donate` }],
      focal: { x: 0.5, y: 0.5 },
    },
  ];

  // --- IMPACT (numeric for count-up in ImpactStrip) ---
  const stats = locale === "lg"
    ? [
        { label: "Abeefunyiddwa obuweereza", value: 25300, approx: true },
        { label: "Ebitundu by’okusomesa/kuyamba", value: 180 },
        { label: "Abeyambako (Volunteers)", value: 420 },
        { label: "Ebitundu ebyatuukiddwako", value: 12 },
      ]
    : [
        { label: "Patients Served", value: 25300, approx: true },
        { label: "Clinics Held", value: 180 },
        { label: "Volunteers", value: 420 },
        { label: "Districts Reached", value: 12 },
      ];

  // --- FALLBACKS so page never looks empty ---
  const fallbackFeatured = [
    { id: "svc1", titleHtml: "Maternal Care", summary: "Antenatal checkups, safe delivery support and postnatal follow-up.", icon: "/images/icons/maternal.png", href: "/#services" },
    { id: "svc2", titleHtml: "Immunization", summary: "Routine vaccines and outreach to increase coverage.", icon: "/images/icons/immunization.png", href: "/#services" },
    { id: "svc3", titleHtml: "Community Outreach", summary: "Health education, screenings and mobile clinics.", icon: "/images/icons/outreach.png", href: "/#services" },
  ];
  const fallbackStories = [
    { id: "post1", title: "Clinic day in Mityana: reaching mothers and children", slug: "clinic-day-mityana", excerpt: "A snapshot from the field…" },
    { id: "post2", title: "How health education cuts malaria cases", slug: "education-cuts-malaria", excerpt: "What outreach changed on the ground…" },
  ];
  const fallbackReviews = [
    { id: "r1", name: "John O.", rating: 5, comment: "The team is kind and professional. Thank you for serving our community." },
    { id: "r2", name: "Jane N.", rating: 4, comment: "They reach people where they are and provide ongoing support." },
    { id: "r3", name: "Grace K.", rating: 5, comment: "My child received vaccines on time. We’re grateful." },
  ];

  // --- FEATURED PROGRAMS (map from WP or fallback) ---
  const featuredFromWp = (services || []).filter((s: any) => s?.acf?.is_featured);
  const programs = featuredFromWp.length
    ? featuredFromWp.map((s: any) => ({
        id: s.id,
        titleHtml: s.title?.rendered || "",
        summary: s.acf?.summary || "",
        icon: s.acf?.icon || "",
        href: s.link || undefined,
      }))
    : fallbackFeatured;

  // --- STORIES (map from WP or fallback, now with image + excerpt) ---
  const stories = (posts && posts.length)
    ? posts.map((p: any) => ({
        id: p.id,
        titleHtml: p.title?.rendered,
        slug: p.slug,
        img: getPostImage(p),
        excerpt: truncate(stripHtml(p.excerpt?.rendered || p.content?.rendered || "")),
      }))
    : fallbackStories.map((p) => ({ ...p, titleHtml: p.title, img: null }));

  // --- REVIEWS (map from WP or fallback), cap to 6 ---
  const reviewCards = (reviews && reviews.length
    ? reviews.map((r: any) => ({
        id: r.id,
        name: r.acf?.reviewer_name || "Anonymous",
        rating: Number(r.acf?.rating ?? 0),
        comment: r.acf?.comment,
      }))
    : fallbackReviews
  ).slice(0, 6);


// Build a simple list for the UI
const storyCards: StoryCard[] = (posts || []).map((p: any) => ({
  id: p.id,
  slug: p.slug,
  titleHtml: p.title?.rendered || "",
  img: extractPostImage(p),
  excerpt: (p.excerpt?.rendered || p.content?.rendered || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180),
}));



  return (
    <main>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* HERO */}
      <HeroMotion slides={slides} locale={locale} />
{/* Timed donation popup */}
      <DonationPopup />

      {/* IMPACT */}
      <ImpactStrip stats={stats} />

      {/* FEATURED PROGRAMS */}
      <Section id="services">
  <FeaturedPrograms items={programs} sectionTitle={dict.sections.services} />
</Section>
      {/* See all services → */}
      <div className="mt-4 -mb-4 text-center">
        <a className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
           href={`/${params.locale}/services`}>
          {locale === "lg" ? "Laba byonna" : "See all services"} →
        </a>
      </div>

      {/* LATEST STORIES — image + title + excerpt */}
     <Section title={dict.sections.stories}>
  <ul className="grid gap-6 md:grid-cols-2">
    {storyCards.map((p) => (
      <li key={p.id} className="rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="relative aspect-[16/9] w-full bg-gray-100">
          {p.img ? (
            <img
              src={p.img}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
              No image
            </div>
          )}
        </div>
        <div className="p-5">
          <h3
            className="mb-2 text-lg font-semibold"
            dangerouslySetInnerHTML={{ __html: p.titleHtml }}
          />
          <p className="text-sm opacity-80">{p.excerpt}…</p>
          <a
            className="mt-3 inline-block text-brand-blue underline"
            href={`/${params.locale}/stories/${p.slug}`}
          >
            {locale === "lg" ? "Soma ebisingawo" : "Read more"}
          </a>
        </div>
      </li>
    ))}
    {!storyCards.length && <p className="opacity-70">No stories yet.</p>}
  </ul>

  {/* Tiny “view all” if there are 3 or more */}
  {storyCards.length >= 3 && (
    <div className="mt-6 text-right">
      <a
        href={`/${params.locale}/stories`}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        {locale === "lg" ? "Laba ebyo byonna" : "View all stories"} →
      </a>
    </div>
  )}
</Section>

      {/* TRANSPARENCY + STORY */}
      <TransparencyBand locale={locale as "en" | "lg"} />
      <OurStory locale={locale as "en" | "lg"} href={`/${params.locale}/about`} />

      {/* REVIEWS (cap 6) with stars + “More reviews” */}
      <TestimonialsSection
        title={dict.sections.reviews}
        items={reviewCards.map((r) => ({
          ...r,
          // Inject simple star string for now (★★★★★ to ☆☆☆☆☆)
          stars: "★★★★★☆☆☆☆☆".slice(5 - Math.max(0, Math.min(5, r.rating)), 10 - Math.max(0, Math.min(5, r.rating))),
        }))}
      />
      {/* External Google Reviews widget */}
<GoogleReviewsEmbed />
      <div className="mt-4 -mb-2 text-center">
        <a className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
           href={`/${params.locale}/reviews`}>
          {locale === "lg" ? "Ebisingawo ku bujulizi" : "More reviews"} →
        </a>
      </div>

      {/* MISSION / VISION */}
      <MissionVision locale={locale as "en" | "lg"} />
{/* Green donation CTA band */}
<GiveCTA locale={locale} />
      {/* PARTNERS */}
      <PartnersStrip />
    </main>
  );
}
