// app/api/payments/swift/email/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const WP_URL = process.env.WP_URL!;
const WP_USER = process.env.WP_BASIC_USER || "";
const WP_PASS_RAW = process.env.WP_BASIC_PASS || "";

// Remove spaces from WP Application Password (safe)
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

// Find intent ID by reference
async function findIntentIdByReference(reference: string): Promise<number | null> {
  // WP REST supports search, but not meta_query by default.
  // Because your CPT title isn't guaranteed, we’ll use search on title if you set it to include reference.
  // If your title does NOT include reference, we'll still proceed without idempotency (but I recommend it does).
  const q = encodeURIComponent(reference);
  const items = await wpRequest(`/wp-json/wp/v2/donation-intents?search=${q}&per_page=5`);
  if (Array.isArray(items) && items.length) {
    // pick the one with exact meta reference match if present
    const exact = items.find((it: any) => it?.meta?.reference === reference);
    return (exact || items[0])?.id ?? null;
  }
  return null;
}

async function markSwiftEmailSent(intentId: number) {
  return wpRequest(`/wp-json/wp/v2/donation-intents/${intentId}`, {
    method: "POST",
    body: JSON.stringify({
      meta: { swift_email_sent: "1" },
    }),
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      donorEmail,
      donorName,
      amount,
      currency,
      reference,
      instructions,
      feeUSD,
      receiveCurrency,
    } = data;

    if (!donorEmail || !reference) {
      return NextResponse.json({ ok: false, error: "Missing donorEmail/reference" }, { status: 400 });
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
          alreadySent = intent?.meta?.swift_email_sent === "1" || intent?.meta?.swift_email_sent === true;
        }
      }
    } catch {
      // If WP check fails, we do not block sending (but duplicates can happen only if called twice)
    }

    if (alreadySent) {
      return NextResponse.json({ ok: true, skipped: "already_sent" });
    }

    // ─────────────────────────────────────────
    // Generate PDF (use absolute base from request host)
    // ─────────────────────────────────────────
    const host = req.headers.get("host")!;
    const proto = host.includes("localhost") ? "http" : "https";
    const base = `${proto}://${host}`;

    const pdfRes = await fetch(`${base}/api/payments/swift/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!pdfRes.ok) {
      const errText = await pdfRes.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `PDF generation failed: ${pdfRes.status} ${errText}` },
        { status: 500 }
      );
    }

    const pdf = Buffer.from(await pdfRes.arrayBuffer());

    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await t.sendMail({
      from: `"Humble Vessel" <${process.env.FROM_EMAIL}>`,
      to: donorEmail,
      subject: `Your SWIFT Transfer Instructions (Ref ${reference})`,
      text: `
Hello ${donorName || "Friend"},

Thank you for choosing to support Humble Vessel Foundation & Clinic.

Attached is a one–page PDF with everything your bank needs to send your donation.

Key points:
• You can send from your local currency (USD, EUR, GBP, etc.).
• Our bank receives funds in ${receiveCurrency || "UGX"} and converts automatically.
• Ask your bank to include this reference exactly:

    ${reference}

A bank on the receiving side may deduct a fixed fee of about USD ${feeUSD ?? 50}.

If you need any help while making the transfer, simply reply to this email or WhatsApp us.

With gratitude,
Humble Vessel Foundation & Clinic
      `.trim(),
      attachments: [
        {
          filename: `HV_SWIFT_${reference}.pdf`,
          content: pdf,
        },
      ],
    });

    // Mark sent in WP (best-effort)
    try {
      if (intentId) await markSwiftEmailSent(intentId);
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
