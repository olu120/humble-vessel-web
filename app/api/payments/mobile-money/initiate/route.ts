export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents"; // your existing helper

export async function POST(req: Request) {
  try {
    const { amount, currency, network, merchantCode } = await req.json();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "";

    if (!amount || !currency) {
      return NextResponse.json({ ok: false, error: "Missing amount/currency" }, { status: 400 });
    }

    // generate a simple reference (same style you used for SWIFT)
    const ref = `${process.env.MOBILE_REFERENCE_PREFIX || "HV-MM-"}${Date.now()}`;

    // Create a pending intent; donor pays via Airtel Merchant on their phone
    const intent = await createDonationIntent({
      amount: Number(amount),
      currency: String(currency || "UGX"),
      method: "mobile_money",
      status: "pending", // until finance confirms
      reference: ref,
      client_ip: ip,
      notes: "Airtel Merchant payment initiated (offline)",
      // @ts-ignore additional meta
      network: String(network || "airtel"),
      // @ts-ignore store merchant code for admin visibility
      merchant_code: String(merchantCode || ""),
    } as any);

    return NextResponse.json({
      ok: true,
      intentId: intent?.id || null,
      reference: ref,
    });
    // ... after you create ref and intent successfully:
try {
  const base = process.env.SITE_URL || "http://localhost:3000";
  // If you collected donorEmail earlier, include it. If not, you can skip or add a small email field later.
  if (/* you have donorEmail */ false) {
    await fetch(`${base}/api/notifications/email/receipt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "local",
        to: /* donorEmail */ "donor@example.com",
        donorName: /* donorName */ undefined,
        amount,
        currency: "UGX",
        reference: ref,
        merchantCode: "6890724",
      }),
    });
  }
} catch {}

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
