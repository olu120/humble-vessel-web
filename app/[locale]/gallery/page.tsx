// app/[locale]/gallery/page.tsx
import Image from "next/image";
import Container from "@/components/Container";
import Section from "@/components/Section";

const galleryImages = [
  {
    src: "/images/gallery-1.jpg",
    alt: "Community clinic outreach",
  },
  {
    src: "/images/gallery-3.jpg",
    alt: "Health education session",
  },
  {
    src: "/images/gallery-4.jpg",
    alt: "Maternal care support",
  },
  {
    src: "/images/gallery-5.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-2.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-6.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-7.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-8.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-9.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-10.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-11.jpg",
    alt: "Volunteers at work",
  },
   {
    src: "/images/gallery-12.jpg",
    alt: "Volunteers at work",
  },
  // add more as you upload them
];

export default function GalleryPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale === "lg" ? "lg" : "en";

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
            {galleryImages.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
