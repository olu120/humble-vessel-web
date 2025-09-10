import Image from "next/image";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Button from "@/components/Button";
import { getPosts, getServices, getApprovedReviews } from "@/lib/wp";
import { getDictionary } from "@/lib/i18n";

export default async function HomePage({ params }: { params: { locale: "en" | "lg" } }) {
  const dict = await getDictionary(params.locale);
  const [posts, services, reviews] = await Promise.all([
    getPosts(),
    getServices(),
    getApprovedReviews(),
  ]);
  const featured = services?.filter((s: any) => s?.acf?.is_featured);

  return (
    <main>
      {/* HERO */}
      <section className="relative h-[46vh] md:h-[60vh] grid place-items-center overflow-hidden">
        <Image src="/images/hero.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/50" />
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-3xl font-semibold md:text-5xl">{dict.hero.title}</h1>
          <p className="max-w-2xl mx-auto mt-3 opacity-90">{dict.hero.subtitle}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <a href={`/${params.locale}/donate`}><Button>{dict.hero.donate}</Button></a>
            <a href={`/${params.locale}/volunteer`}><Button variant="secondary">{dict.hero.volunteer}</Button></a>
          </div>
        </Container>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-yellow" />
      </section>

      {/* FEATURED SERVICES */}
      <Section title={dict.sections.services} bg="alt">
        <ul className="grid gap-6 md:grid-cols-3">
          {featured?.map((s: any) => (
            <li key={s.id} className="p-5 bg-white rounded-2xl shadow-card">
              <div className="flex items-center gap-3 mb-2">
                {s.acf?.icon && <img src={s.acf.icon} alt="" className="w-10 h-10 rounded" />}
                <h3 className="text-lg font-medium" dangerouslySetInnerHTML={{ __html: s.title?.rendered }} />
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
              <h3 className="mb-2 text-xl font-medium" dangerouslySetInnerHTML={{ __html: p.title.rendered }} />
              <a className="inline-block mt-2 underline text-brand-blue" href={`/${params.locale}/stories/${p.slug}`}>
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
    </main>
  );
}
