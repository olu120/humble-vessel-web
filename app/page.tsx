// app/page.tsx
import { getPosts, getPageBySlug } from '@/lib/wp';

export default async function HomePage() {
  const [home, posts] = await Promise.all([getPageBySlug('home'), getPosts()]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="mb-10">
        <h1 className="text-3xl font-semibold">
          {home?.title?.rendered ?? 'Humble Vessel Foundation & Clinic'}
        </h1>
        {home?.content?.rendered && (
          <article
            className="prose mt-4"
            dangerouslySetInnerHTML={{ __html: home.content.rendered }}
          />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Latest Stories</h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {Array.isArray(posts) && posts.map((p: any) => (
            <li key={p.id} className="rounded-2xl p-5 shadow">
              <h3
                className="text-xl font-medium mb-2"
                dangerouslySetInnerHTML={{ __html: p.title.rendered }}
              />
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: p.excerpt.rendered }}
              />
              <a className="inline-block mt-3 underline" href={`/stories/${p.slug}`}>
                Read more
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
