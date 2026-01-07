// app/api/notifications/email/receipt/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { tplLocalAirtel } from "@/lib/email-templates";

const WP_URL = process.env.WP_URL!;
const WP_USER = process.env.WP_BASIC_USER || "";
const WP_PASS_RAW = process.env.WP_BASIC_PASS || "";

function wpAuthHeader() {
  const pass = WP_PASS_RAW.replace(/\s+/g, "").trim();
  const user = WP_USER.trim();
  const basic = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${basic}`;
}

async function wpRequest(path: string, init?: RequestInit) {
  const res = await fetch(`${WP_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: wpAuthHeader(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`WP ${res.status}: ${typeof data === "string" ? data : data?.message || "Unknown error"}`);
  }
  return data;
}

async function findIntentIdByReference(reference: string): Promise<number | null> {
  const q = encodeURIComponent(reference);
  const items = await wpRequest(`/wp-json/wp/v2/donation-intents?search=${q}&per_page=5`);
  if (Array.isArray(items) && items.length) {
    const exact = items.find((it: any) => it?.meta?.reference === reference);
    return (exact || items[0])?.id ?? null;
  }
  return null;
}

async function markLocalEmailSent(intentId: number) {
  return wpRequest(`/wp-json/wp/v2/donation-intents/${intentId}`, {
    method: "POST",
    body: JSON.stringify({
      meta: { mm_email_sent: "1" },
    }),
  });
}

/**
 * POST body:
 * {
 *   type: "local" | "swift",
 *   to: "donor@example.com",
 *   donorName?: string,
 *   amount: number,
 *   currency: string,
 *   reference: string,
 *   merchantCode?: string
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, to, donorName, amount, currency, reference } = body;

    if (!type || !to || !amount || !currency || !reference) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // ✅ SWIFT handled elsewhere (as you already intended)
    if (type === "swift") {
      return NextResponse.json({ ok: true, skipped: "swift handled by /api/payments/swift/email" });
    }

    if (type !== "local") {
      return NextResponse.json({ ok: false, error: `Unsupported receipt type: ${type}` }, { status: 400 });
    }

    // ─────────────────────────────────────────
    // ✅ Idempotency guard via WordPress meta
    // ─────────────────────────────────────────
    let intentId: number | null = null;
    let alreadySent = false;

    try {
      if (WP_URL && WP_USER && WP_PASS_RAW) {
        intentId = await findIntentIdByReference(reference);
        if (intentId) {
          const intent = await wpRequest(`/wp-json/wp/v2/donation-intents/${intentId}`);
          alreadySent = intent?.meta?.mm_email_sent === "1" || intent?.meta?.mm_email_sent === true;
        }
      }
    } catch {
      // If WP check fails, do not block sending
    }

    if (alreadySent) {
      return NextResponse.json({ ok: true, skipped: "already_sent" });
    }

    const merchantCode = body.merchantCode || "6890724";

    await sendMail({
      to,
      subject: `Your Airtel Merchant Instructions – Ref ${reference}`,
      html: tplLocalAirtel({
        donorName,
        amount,
        currency,
        reference,
        merchantCode,
      }),
    });

    // Mark sent (best-effort)
    try {
      if (intentId) await markLocalEmailSent(intentId);
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
