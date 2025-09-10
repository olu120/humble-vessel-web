const WP_URL = process.env.WP_URL!;
const WP_USER = process.env.WP_BASIC_USER || "";
const WP_PASS = process.env.WP_BASIC_PASS || "";

function requireCreds() {
  if (!WP_URL) throw new Error("WP_URL missing");
  if (!WP_USER || !WP_PASS) throw new Error("WordPress Application Password creds missing");
}

async function wpJson(path: string, init?: RequestInit) {
  requireCreds();
  const basic = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

  const res = await fetch(`${WP_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basic}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    // Surface full error to server logs AND caller
    console.error("WP error", res.status, text);
    throw new Error(`WP ${res.status}: ${text}`);
  }
  return JSON.parse(text);
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
};

export async function createDonationIntent(p: IntentPayload) {
  const title = p.title || `${p.method.toUpperCase()} ${p.currency} ${p.amount}`;
  const body = {
    title,
    status: "publish",
    meta: {
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      status: p.status,
      reference: p.reference || "",
      phone: p.phone || "",
      network: p.network || "",
      locale: p.locale || "en",
      client_ip: p.client_ip || "",
      notes: p.notes || "",
    },
  };
  return wpJson(`/wp-json/wp/v2/donation-intents`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateDonationIntent(id: number, patch: Partial<IntentPayload>) {
  const meta: any = {};
  [
    "amount","currency","method","status","reference",
    "phone","network","locale","client_ip","notes",
  ].forEach((k) => {
    const v = (patch as any)[k];
    if (v !== undefined) meta[k] = v;
  });

  return wpJson(`/wp-json/wp/v2/donation-intents/${id}`, {
    method: "POST",
    body: JSON.stringify({ meta }),
  });
}
