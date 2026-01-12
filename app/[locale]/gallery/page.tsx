// app/[locale]/gallery/page.tsx
import Image from "next/image";
import Container from "@/components/Container";
import Section from "@/components/Section";
import { getGalleryImages } from "@/lib/wp";

export const revalidate = 600; // 10 minutes

export default async function GalleryPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale === "lg" ? "lg" : "en";

  const wpImages = await getGalleryImages();

  // fallback (optional): if WP empty, still show local images
  const fallbackImages = [
    { url: "/images/gallery-1.jpg", alt: "Community clinic outreach" },
    { url: "/images/gallery-3.jpg", alt: "Health education session" },
    { url: "/images/gallery-4.jpg", alt: "Maternal care support" },
    { url: "/images/gallery-5.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-2.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-6.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-7.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-8.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-9.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-10.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-11.jpg", alt: "Volunteers at work" },
    { url: "/images/gallery-12.jpg", alt: "Volunteers at work" },
  ];

  const images = wpImages.length ? wpImages : fallbackImages;

  return (
    <main>
      <Section
        title={locale === "lg" ? "Ebifaananyi" : "Gallery"}
        subtitle={
          locale === "lg"
            ? "Ebifananyi okuva mu mirimu gy’eddwaanyi, ebiwanika n’ensonga zaffe."
            : "Moments from clinics, outreach, education sessions, and community life."
        }
      >
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100"
              >
                <Image
                  src={img.url}
                  alt={img.alt || "Gallery image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>

          {!images.length && (
            <p className="mt-6 text-sm opacity-70">
              {locale === "lg"
                ? "Tewali bifaananyi biriwo kati."
                : "No gallery images yet."}
            </p>
          )}
        </Container>
      </Section>
    </main>
  );
}
