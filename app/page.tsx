import { getPosts } from '@/lib/wp'; 
import { getServices, getApprovedReviews } from '@/lib/wp';

export default async function HomePage() {
  const [posts, services, reviews] = await Promise.all([
    getPosts(),
    getServices(),
    getApprovedReviews(),
  ]);

  const featured = services?.filter((s: any) => s?.acf?.is_featured);
  

  return (
    <main className="max-w-6xl p-6 mx-auto space-y-12">
      <section>
        <h1 className="text-3xl font-semibold">Home</h1>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Our Featured Services</h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {featured?.map((s: any) => (
            <li key={s.id} className="p-5 shadow rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                {s.acf?.icon && <img src={s.acf.icon} alt="" className="w-8 h-8" />}
                <h3 className="text-lg font-medium">
                  {s.acf?.title_override || s.title?.rendered}
                </h3>
              </div>
              <p className="text-sm opacity-80">{s.acf?.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Latest Stories</h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {posts?.map((p: any) => (
            <li key={p.id} className="p-5 shadow rounded-2xl">
              <h3
                className="mb-2 text-xl font-medium"
                dangerouslySetInnerHTML={{ __html: p.title.rendered }}
              />
              <a className="inline-block mt-3 underline" href={`/stories/${p.slug}`}>
                Read more
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Reviews</h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {reviews?.map((r: any) => (
            <li key={r.id} className="p-5 shadow rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <strong>{r.acf?.reviewer_name || 'Anonymous'}</strong>
                <span className="text-sm opacity-70">• {r.acf?.rating}/5</span>
              </div>
              <p className="text-sm opacity-90">{r.acf?.comment}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
