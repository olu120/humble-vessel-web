// lib/wp.ts
const WP_URL = process.env.WP_URL!;

type FetchOpts = { revalidate?: number; auth?: boolean };

export async function wpFetch<T = any>(path: string, opts: FetchOpts = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // If later you enable Application Passwords for writes (server-only):
  if (opts.auth) {
    const u = process.env.WP_BASIC_USER!;
    const p = process.env.WP_BASIC_PASS!;
    const token = Buffer.from(`${u}:${p}`).toString('base64');
    headers.Authorization = `Basic ${token}`;
  }

  const res = await fetch(`${WP_URL}${path}`, {
    headers,
    next: { revalidate: opts.revalidate ?? 600 }, // ISR
  });

  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);
  return (await res.json()) as T;
}

/** BLOG / STORIES */
export async function getPosts() {
  return wpFetch(`/wp-json/wp/v2/posts?per_page=6&_embed=1`);
}

export async function getPageBySlug(slug: string) {
  const pages = await wpFetch(`/wp-json/wp/v2/pages?slug=${slug}`);
  return Array.isArray(pages) ? pages[0] : pages;
}

/** CMS STRUCTURE */
export async function getServices() {
  return wpFetch(`/wp-json/wp/v2/services?per_page=100&_fields=id,slug,title,acf`);
}

export async function getApprovedReviews() {
  const all = await wpFetch(`/wp-json/wp/v2/reviews?per_page=100&_fields=id,slug,title,acf`);
  return all.filter((r: any) => r?.acf?.approved === 1 || r?.acf?.approved === true);
}

export async function getTeam() {
  return wpFetch(`/wp-json/wp/v2/team?per_page=50&_fields=id,slug,title,acf`);
}
