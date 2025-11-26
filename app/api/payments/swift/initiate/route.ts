// app/api/donate/initiative/swift/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents";
import { allow } from "@/lib/ratelimit";

type Cadence = "one_time" | "weekly" | "biweekly" | "monthly";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0];

    if (!allow(ip)) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    const amount = Number(body.amount || 0);
    const donorEmail = (body.donorEmail || "").trim();
    const donorName = (body.donorName || "").trim();
    const sendCur = (body.currency || "USD").toUpperCase();
    const cadence: Cadence = body.cadence || "one_time";

    if (!amount || !donorEmail) {
      return NextResponse.json(
        { ok: false, error: "Missing amount or donor email" },
        { status: 400 }
      );
    }

    // ---- Reference ----
    const reference = `${process.env.SWIFT_REFERENCE_PREFIX || "HV-"}${Date.now()}`;
    const recvCur = process.env.SWIFT_RECEIVE_CURRENCY || "UGX";
    const feeUSD = Number(process.env.SWIFT_FIXED_FEE_USD || 50);

    // ---- CLEAN, SIMPLE, DONOR-FRIENDLY INSTRUCTIONS ----
    const instructions = `
International Bank Transfer (SWIFT)

Thank you for your donation. Please complete your gift by making a SWIFT transfer using the details below. 

Include the Payment Reference exactly as shown so we can match your transfer.

Amount to Send: ${sendCur} ${amount.toLocaleString()}
Receiving Currency: ${recvCur}
Estimated Bank Fee: USD ${feeUSD}

Payment Reference (REQUIRED): ${reference}

Beneficiary Bank:
${process.env.SWIFT_BANK_NAME}
${process.env.SWIFT_BANK_ADDRESS}
SWIFT/BIC: ${process.env.SWIFT_SWIFT_BIC}
Account Number: ${process.env.SWIFT_ACCOUNT_NUMBER}

Beneficiary:
${process.env.SWIFT_BENEFICIARY_NAME}
${process.env.SWIFT_BENEFICIARY_ADDRESS}

Notes:
• Some banks deduct a fixed receiving fee (usually around USD ${feeUSD}).
• International transfers typically start from USD 100.
• Please share this information directly with your bank or enter it into your online banking app.
    `.trim();

    // ---- Save intent ----
    await createDonationIntent({
      amount,
      currency: sendCur,
      method: "swift",
      status: "issued_instructions",
      reference,
      client_ip: ip,
      notes: "SWIFT instructions issued",

      // Meta saved in WordPress
      // @ts-ignore
      donor_email: donorEmail,
      // @ts-ignore
      donor_name: donorName,
      // @ts-ignore
      recurring_cadence: cadence,
    });

    // ---- Email instructions ----
    const base = process.env.SITE_URL || "http://localhost:3000";

    fetch(`${base}/api/payments/swift/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donorEmail,
        donorName,
        amount,
        currency: sendCur,
        reference,
        instructions,
        feeUSD,
        receiveCurrency: recvCur,
      }),
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      reference,
      amount,
      currency: sendCur,
      donorEmail,
      donorName,
      instructions,
    });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
