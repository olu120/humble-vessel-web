import Container from "@/components/Container";
import Reveal from "@/components/Reveal";

type Program = { id: number | string; titleHtml: string; summary?: string; icon?: string; href?: string };

export default function FeaturedPrograms({ items, sectionTitle }: { items: Program[]; sectionTitle: string }) {
  return (
    <section id="services" className="py-8 md:py-12 bg-neutral-50">
      <Container>
        <Reveal as="h2" className="text-lg md:text-2xl font-semibold mb-4 md:mb-6">
          {sectionTitle}
        </Reveal>

        <ul className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {items.map((p) => (
            <Reveal
              as="li"
              key={p.id}
              className="p-4 md:p-5 bg-white rounded-2xl border shadow-sm card-smooth"
            >
              <div className="flex items-center gap-3 mb-2">
                {p.icon ? (
                  <img
                    src={p.icon}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="w-9 h-9 md:w-10 md:h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded bg-neutral-100" />
                )}
                <h3
                  className="text-base md:text-lg font-medium"
                  dangerouslySetInnerHTML={{ __html: p.titleHtml }}
                />
              </div>
              <p className="text-sm opacity-80">{p.summary}</p>
              {!!p.href && (
                <a href={p.href} className="mt-3 inline-flex items-center text-sm text-brand-blue hover:underline">
                  Learn more
                </a>
              )}
            </Reveal>
          ))}
          {!items.length && <p className="opacity-70">No featured programs yet.</p>}
        </ul>
      </Container>
    </section>
  );
}
