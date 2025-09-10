import { wpFetch } from "@/lib/wp";

export default async function StoryPage({
  params,
}: { params: { locale: "en" | "lg"; slug: string } }) {
  const posts = await wpFetch(`/wp-json/wp/v2/posts?slug=${params.slug}&_embed=1`);
  const post = Array.isArray(posts) ? posts[0] : posts;
  if (!post) return <div className="p-6">Story not found.</div>;

  return (
    <article className="mx-auto max-w-3xl p-6">
      <h1
        className="text-3xl font-semibold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </article>
  );
}
