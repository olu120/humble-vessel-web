// lib/wp-intents.ts
const WP_URL = process.env.WP_URL!;
const WP_USER = process.env.WP_BASIC_USER || "";
const WP_PASS_RAW = process.env.WP_BASIC_PASS || "";

// If you ever change the CPT slug, you can set this.
// Default keeps your current endpoint.
const WP_INTENTS_ENDPOINT =
  process.env.WP_DONATION_INTENTS_ENDPOINT || "/wp-json/wp/v2/donation-intents";

function requireCreds() {
  if (!WP_URL) throw new Error("WP_URL missing");
  if (!WP_USER || !WP_PASS_RAW) {
    throw new Error("WordPress Application Password creds missing");
  }
}

/**
 * WordPress Application Passwords are often shown with spaces (e.g. "abcd efgh ...").
 * Normalize by removing whitespace to avoid copy/paste issues.
 */
function getBasicAuthHeader() {
  const pass = WP_PASS_RAW.replace(/\s+/g, "").trim();
  const user = WP_USER.trim();

  const basic = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${basic}`;
}

async function wpJson(path: string, init?: RequestInit) {
  requireCreds();

  const res = await fetch(`${WP_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: getBasicAuthHeader(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();

  // Try parse JSON for better error surfacing
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Surface full error to server logs AND caller
    console.error("WP error", {
      status: res.status,
      path,
      response: data || text,
    });

    // Prefer WP's message if present
    const msg =
      data?.message ||
      data?.error ||
      (typeof text === "string" ? text : `WP ${res.status}`);

    throw new Error(`WP ${res.status}: ${msg}`);
  }

  return data ?? JSON.parse(text);
}

export type IntentPayload = {
  title?: string;
  amount: number;
  currency: string;
  method: "mobile_money" | "swift";
  status: "pending" | "initiated" | "succeeded" | "failed" | "issued_instructions";
  reference?: string;
  phone?: string;
  network?: "mtn" | "airtel";
  locale?: "en" | "lg";
  client_ip?: string;
  notes?: string;

  // allow extra meta keys without TS-ignore everywhere
  [key: string]: any;
};

export async function createDonationIntent(p: IntentPayload) {
  const title = p.title || `${p.method.toUpperCase()} ${p.currency} ${p.amount}`;

  // ✅ include any extra fields passed in (donor_email, donor_name, recurring_cadence, etc.)
  const {
    title: _t,
    amount,
    currency,
    method,
    status,
    reference,
    phone,
    network,
    locale,
    client_ip,
    notes,
    ...extraMeta
  } = p;

  const body = {
    title,
    status: "publish",
    meta: {
      amount,
      currency,
      method,
      status,
      reference: reference || "",
      phone: phone || "",
      network: network || "",
      locale: locale || "en",
      client_ip: client_ip || "",
      notes: notes || "",

      // ✅ extra meta (donor_email, donor_name, recurring_cadence, merchant_code, etc.)
      ...extraMeta,
    },
  };

  return wpJson(WP_INTENTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateDonationIntent(id: number, patch: Partial<IntentPayload>) {
  const meta: any = {};

  // copy known keys
  [
    "amount",
    "currency",
    "method",
    "status",
    "reference",
    "phone",
    "network",
    "locale",
    "client_ip",
    "notes",
  ].forEach((k) => {
    const v = (patch as any)[k];
    if (v !== undefined) meta[k] = v;
  });

  // ✅ also include any extra keys in patch
  Object.keys(patch || {}).forEach((k) => {
    if (meta[k] !== undefined) return;
    const v = (patch as any)[k];
    if (v !== undefined) meta[k] = v;
  });

  return wpJson(`${WP_INTENTS_ENDPOINT}/${id}`, {
    method: "POST",
    body: JSON.stringify({ meta }),
  });
}
