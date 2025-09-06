// lib/wp.ts
const WP_URL = process.env.WP_URL;

if (!WP_URL) {
  throw new Error('Missing WP_URL environment variable');
}

type FetchOpts = {
  /** ISR revalidate seconds (default 600 = 10min) */
  revalidate?: number;
  /** Use Basic Auth (for server-only, future writes) */
  auth?: boolean;
  /** Optional extra headers */
  headers?: Record<string, string>;
};

export async function wpFetch<T = any>(path: string, opts: FetchOpts = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };

  // Future: authenticated requests (server-only)
  if (opts.auth) {
    const u = process.env.WP_BASIC_USER!;
    const p = process.env.WP_BASIC_PASS!;
    const token = Buffer.from(`${u}:${p}`).toString('base64');
    headers.Authorization = `Basic ${token}`;
  }

  // Normalize path (allow passing with or without leading slash)
  const url = `${WP_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    headers,
    // App Router: use Next.js caching/ISR
    next: { revalidate: opts.revalidate ?? 600 },
  });

  // Helpful error with body sample
  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {}
    throw new Error(`WP fetch failed: ${res.status} ${res.statusText}\nURL: ${url}\nBody: ${body?.slice(0, 500)}`);
  }

  return (await res.json()) as T;
}

/** Latest 6 posts (with _embed for media/author if needed later) */
export async function getPosts(params?: { perPage?: number }) {
  const perPage = params?.perPage ?? 6;
  return wpFetch(`/wp-json/wp/v2/posts?per_page=${perPage}&_embed=1`);
}

/** Single page by slug (e.g., 'home', 'services', 'about') */
export async function getPageBySlug(slug: string) {
  const pages = await wpFetch(`/wp-json/wp/v2/pages?slug=${slug}`);
  return Array.isArray(pages) ? pages[0] : pages;
}

/** Example: get Services page + ACF fields (repeater) */
export async function getServicesPage() {
  // ACF fields appear under `acf` if ACF 5.11+ is active and the field group applies to this page
  // You can trim payload with _fields (optional):
  // const q = `/wp-json/wp/v2/pages?slug=services&_fields=id,slug,title,content,acf`;
  const q = `/wp-json/wp/v2/pages?slug=services`;
  const pages = await wpFetch(q);
  const page = Array.isArray(pages) ? pages[0] : pages;
  return page;
}
