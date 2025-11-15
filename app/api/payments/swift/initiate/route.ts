export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents";
import { allow } from "@/lib/ratelimit";

type Cadence = "one_time" | "weekly" | "biweekly" | "monthly";

export async function POST(req: Request) {
  try {
    // ---- parse body (with cadence) ----
    const body = await req.json() as {
      amount?: number | string;
      currency?: string;
      donorName?: string;
      donorEmail?: string;
      cadence?: Cadence;
    };

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "";
    if (!allow(ip)) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    const amountNum = Number(body?.amount ?? 0);
    const donorName  = (body?.donorName || "").trim();
    const donorEmail = (body?.donorEmail || "").trim();
    const sendCur    = String(body?.currency || "USD").toUpperCase();
    const cadence: Cadence = (body?.cadence as Cadence) || "one_time";

    if (!amountNum || !donorEmail) {
      return NextResponse.json({ ok: false, error: "Missing amount or donor email" }, { status: 400 });
    }

    // ---- env + reference ----
    const ref     = `${process.env.SWIFT_REFERENCE_PREFIX || "HV-SWIFT-"}${Date.now()}`;
    const recvCur = process.env.SWIFT_RECEIVE_CURRENCY || "UGX";
    const feeUSD  = Number(process.env.SWIFT_FIXED_FEE_USD || 50);
    const feeNote = process.env.SWIFT_FEES_NOTE || "A bank fee may be deducted on receipt.";

    // ---- optional intermediary block ----
    const intermediary =
      (process.env.SWIFT_INTERMEDIARY_BANK_NAME || process.env.SWIFT_INTERMEDIARY_SWIFT_BIC)
        ? `
Intermediary/Correspondent Bank:
  Name: ${process.env.SWIFT_INTERMEDIARY_BANK_NAME || "<Name>"}
  Address: ${process.env.SWIFT_INTERMEDIARY_BANK_ADDRESS || "<Address>"}
  SWIFT/BIC: ${process.env.SWIFT_INTERMEDIARY_SWIFT_BIC || "<SWIFT/BIC>"}`
            .trim()
        : "";

    // ---- instructions text ----
    const instructions = `
Bank Transfer (SWIFT) Instructions

Beneficiary:
  Name: ${process.env.SWIFT_BENEFICIARY_NAME || "<Beneficiary Name>"}
  Address: ${process.env.SWIFT_BENEFICIARY_ADDRESS || "<Beneficiary Address>"}

Beneficiary Bank:
  Name: ${process.env.SWIFT_BANK_NAME || "<Bank Name>"}
  Address: ${process.env.SWIFT_BANK_ADDRESS || "<Bank Address>"}
  SWIFT/BIC: ${process.env.SWIFT_SWIFT_BIC || "<SWIFT/BIC>"}

Account Number: ${process.env.SWIFT_ACCOUNT_NUMBER || "<Account Number>"}

Amount to Send: ${sendCur} ${amountNum}
Receiving Currency: ${recvCur} (converted by bank FX rate)
Fixed Receiving Bank Fee: USD ${feeUSD}

Payment Reference (include exactly): ${ref}

${intermediary ? intermediary + "\n" : ""}Notes: ${feeNote}`.trim();

    // ---- save intent to WP (includes cadence) ----
    const intent = await createDonationIntent({
      amount: amountNum,
      currency: sendCur,         // donor send currency
      method: "swift",
      status: "issued_instructions",
      reference: ref,
      client_ip: ip,
      notes: "SWIFT instructions issued",

      // meta
      // @ts-ignore
      donor_name: donorName,
      // @ts-ignore
      donor_email: donorEmail,
      // @ts-ignore
      send_currency: sendCur,
      // @ts-ignore
      receive_currency: recvCur,
      // @ts-ignore
      fixed_fee_usd: feeUSD,
      // @ts-ignore
      recurring_cadence: cadence,  // <--- NEW
    } as any);

    // ---- email: fire-and-forget (instructions email) ----
    try {
      const base = process.env.SITE_URL || "http://localhost:3000";
      fetch(`${base}/api/payments/swift/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorEmail,
          donorName,
          instructions,
          reference: ref,
          amount: amountNum,
          currency: sendCur,
          feeUSD,
          receiveCurrency: recvCur,
        }),
      }).catch(() => {});
    } catch {}

    // ---- (optional) quick receipt email without PDF ----
    try {
      const base = process.env.SITE_URL || "http://localhost:3000";
      await fetch(`${base}/api/notifications/email/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "swift",
          to: donorEmail,
          donorName,
          amount: amountNum,
          currency: sendCur,
          reference: ref,
        }),
      });
    } catch {}

    // ---- response ----
    return NextResponse.json({
      ok: true,
      instructions,
      reference: ref,
      amount: amountNum,
      currency: sendCur,
      donorName,
      donorEmail,
      feeUSD,
      receiveCurrency: recvCur,
      intentId: intent?.id || null,
      cadence, // echoed back (optional)
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
