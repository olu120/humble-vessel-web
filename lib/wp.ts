// lib/wp.ts

// ---- Env guard -------------------------------------------------------------
const WP_URL = process.env.WP_URL;
if (!WP_URL) {
  throw new Error(
    'Missing WP_URL environment variable. Add it to .env.local and Vercel envs.'
  );
}

// ---- Types (adjust as your ACF evolves) ------------------------------------
export type Service = {
  id: number;
  slug: string;
  title?: { rendered: string } | string;
  acf?: {
    title_override?: string;
    summary?: string;
    icon?: string | number; // WP can return URL or numeric ID
    is_featured?: boolean | 0 | 1;
  };
};

export type Review = {
  id: number;
  slug: string;
  title?: { rendered: string } | string;
  acf?: {
    reviewer_name?: string;
    rating?: number;
    comment?: string;
    approved?: boolean | 0 | 1;
  };
};

export type TeamMember = {
  id: number;
  slug: string;
  title?: { rendered: string } | string;
  acf?: {
    role_title?: string;
    photo?: string; // URL
    bio?: string;
    whatsapp?: string;
    email?: string;
  };
};

// ---- Core fetch wrapper ----------------------------------------------------
type FetchOpts = { revalidate?: number; auth?: boolean; headers?: Record<string, string> };

export async function wpFetch<T = any>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers ?? {}) };

  // Only needed later if you enable Basic Auth (Application Passwords) for writes
  if (opts.auth) {
    const u = process.env.WP_BASIC_USER!;
    const p = process.env.WP_BASIC_PASS!;
    const token = Buffer.from(`${u}:${p}`).toString('base64');
    headers.Authorization = `Basic ${token}`;
  }

  const url = `${WP_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: opts.revalidate ?? 600 }, // sensible default ISR: 10 mins
  });

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    throw new Error(`WP fetch failed: ${res.status} ${res.statusText}\nURL: ${url}\nBody: ${body?.slice(0, 400)}`);
  }

  return (await res.json()) as T;
}

// ---- Helpers to resolve media IDs to URLs ----------------------------------
type WPMedia = { id: number; source_url: string };

async function getMediaByIds(ids: number[]): Promise<Record<number, string>> {
  if (!ids.length) return {};
  const uniq = Array.from(new Set(ids));
  // Batch request using include=ID,ID,...
  const list = await wpFetch<WPMedia[]>(
    `/wp-json/wp/v2/media?include=${uniq.join(',')}&per_page=${uniq.length}&_fields=id,source_url`
  );
  const map: Record<number, string> = {};
  for (const m of list) map[m.id] = m.source_url;
  return map;
}

function isTruthyFeatured(v: unknown) {
  return v === true || v === 1 || v === '1';
}

// ---- BLOG / PAGES ----------------------------------------------------------
export async function getPosts() {
  return wpFetch(`/wp-json/wp/v2/posts?per_page=6&_embed=1`);
}

export async function getPageBySlug(slug: string) {
  const pages = await wpFetch(`/wp-json/wp/v2/pages?slug=${slug}`);
  return Array.isArray(pages) ? pages[0] : pages;
}

// ---- CMS STRUCTURE ---------------------------------------------------------

/**
 * Fetch services, automatically converting acf.icon IDs → URLs.
 * Return type keeps your existing shape, but icon will be a string URL or ''.
 */
export async function getServices(): Promise<Service[]> {
  const services = await wpFetch<Service[]>(
    `/wp-json/wp/v2/services?per_page=100&_fields=id,slug,title,acf`
  );

  // Collect numeric icon IDs to resolve
  const iconIds = services
    .map((s) => (typeof s.acf?.icon === 'number' ? s.acf!.icon : null))
    .filter((v): v is number => typeof v === 'number');

  if (iconIds.length === 0) return services as Service[];

  const mediaMap = await getMediaByIds(iconIds);

  // Replace numeric IDs with URLs
  return services.map((s) => {
    const icon = s.acf?.icon;
    if (typeof icon === 'number') {
      return {
        ...s,
        acf: { ...s.acf, icon: mediaMap[icon] || '' },
      };
    }
    return s;
  });
}

export async function getApprovedReviews(): Promise<Review[]> {
  // Fetch and filter on the server (simple + plugin-free)
  const all = await wpFetch<Review[]>(
    `/wp-json/wp/v2/reviews?per_page=100&_fields=id,slug,title,acf`
  );
  return all.filter((r) => isTruthyFeatured(r?.acf?.approved));
}

export async function getTeam(): Promise<TeamMember[]> {
  return wpFetch<TeamMember[]>(
    `/wp-json/wp/v2/team?per_page=50&_fields=id,slug,title,acf`
  );
}
