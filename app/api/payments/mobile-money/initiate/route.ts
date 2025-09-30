export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents"; // your existing helper

type Body = {
  amount: number | string;
  currency?: string;
  donorEmail?: string;
  locale?: "en" | "lg";
  // we accept but ignore overrides; we hard-set Airtel merchant in meta
  network?: "airtel" | "mtn";
  merchantCode?: string;
};

function makeRef(prefix = process.env.MOBILE_REFERENCE_PREFIX || "HV-MM-") {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `${prefix}${rand}-${ts}`;
}

export async function POST(req: Request) {
  let reference = makeRef();
  try {
    const { amount, currency = "UGX", donorEmail, locale = "en" } = (await req.json()) as Body;

    // Basic validate amount
    const amt = Number(amount);
    if (!amt || Number.isNaN(amt) || amt <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }

    // Client IP (best-effort)
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

    // Try to record in WP — but *do not* fail the whole flow if WP is down.
    try {
      await createDonationIntent({
        amount: amt,
        currency: String(currency || "UGX"),
        method: "mobile_money",
        status: "issued_instructions", // we issued instructions PDF
        reference,
        client_ip: ip,
        notes: "Airtel Merchant payment initiated (offline)",
        // extra meta for admin:
        // @ts-ignore
        network: "airtel",
        // @ts-ignore
        merchant_code: "6890724",
        // @ts-ignore
        donor_email: donorEmail || "",
        // @ts-ignore
        send_currency: "UGX",
        // @ts-ignore
        receive_currency: "UGX",
        // @ts-ignore
        locale,
      } as any);
    } catch (wpErr) {
      console.error("WP createDonationIntent failed:", wpErr);
      // continue; we'll still return reference so UI goes to success page
    }

    return NextResponse.json({ ok: true, reference }, { status: 200 });
  } catch (e: any) {
    console.error("MM initiate fatal:", e?.message || e);
    // Even if parsing failed, return a cancel signal
    return NextResponse.json({ ok: false, error: "init_failed" }, { status: 200 });
  }
}
