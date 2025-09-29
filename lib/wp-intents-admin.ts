// lib/wp-intents-admin.ts
const WP_URL = process.env.WP_URL!;
const WP_BASIC_USER = process.env.WP_BASIC_USER!;
const WP_BASIC_PASS = process.env.WP_BASIC_PASS!;

if (!WP_URL) {
  throw new Error("WP_BASE env var is missing");
}

function authHeader() {
  const b64 = Buffer.from(`${WP_BASIC_USER}:${WP_BASIC_PASS}`).toString("base64");
  return { Authorization: `Basic ${b64}` };
}

export type IntentItem = {
  id: number;
  date?: string;
  modified?: string;
  title?: { rendered: string };
  meta?: Record<string, any>;
};

export async function wpListIntents(params: {
  method?: "swift" | "mobile_money";
  status?: string;
  search?: string;
  perPage?: number;
  page?: number;
}) {
  const q = new URLSearchParams();

  // include timestamps for CSV
  q.set("_fields", "id,date,modified,title,meta,link");
 q.set("per_page", String(Math.min(params.perPage ?? 20, 100)));
  q.set("page", String(params.page ?? 1));

  if (params.search) q.set("search", params.search);

  // meta_query for method/status (REST supports JSON array)
  const metaQuery: any[] = [];
  if (params.method) metaQuery.push({ key: "method", value: params.method });
  if (params.status) metaQuery.push({ key: "status", value: params.status });
  if (metaQuery.length) q.set("meta_query", JSON.stringify(metaQuery));

  const url = `${WP_URL}/wp-json/wp/v2/donation-intents?${q.toString()}`;
  const res = await fetch(url, { headers: { ...authHeader() } });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`WP list failed: ${res.status} ${txt}`);
  }

  const items = (await res.json()) as IntentItem[];
  const total = Number(res.headers.get("X-WP-Total") || "0");
  const totalPages = Number(res.headers.get("X-WP-TotalPages") || "0");
  return { items, total, totalPages };
}

export async function wpUpdateIntentMeta(
  id: number,
  patch: Record<string, any>
) {
  const url = `${WP_URL}/wp-json/wp/v2/donation-intents/${id}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ meta: patch }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`WP update failed: ${res.status} ${txt}`);
  }
  return res.json();
}
