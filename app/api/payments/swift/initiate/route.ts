import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents";
import { allow } from "@/lib/ratelimit";


export async function POST(req: Request) {
  try {
    const { amount, currency, donorName, donorEmail } = await req.json();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "";
if (!allow(ip)) return NextResponse.json({ ok:false, error:"Too many requests" }, { status: 429 });

    const ref = `${process.env.SWIFT_REFERENCE_PREFIX || "HV-"}${Date.now()}`;
    const sendCur = (currency || "USD").toUpperCase();
    const recvCur = process.env.SWIFT_RECEIVE_CURRENCY || "UGX";
    const feeUSD = Number(process.env.SWIFT_FIXED_FEE_USD || 50);
    const feeNote = process.env.SWIFT_FEES_NOTE || "A bank fee may be deducted on receipt.";

    const intermediary = (process.env.SWIFT_INTERMEDIARY_BANK_NAME || process.env.SWIFT_INTERMEDIARY_SWIFT_BIC)
      ? `
Intermediary/Correspondent Bank:
  Name: ${process.env.SWIFT_INTERMEDIARY_BANK_NAME || "<Name>"}
  Address: ${process.env.SWIFT_INTERMEDIARY_BANK_ADDRESS || "<Address>"}
  SWIFT/BIC: ${process.env.SWIFT_INTERMEDIARY_SWIFT_BIC || "<SWIFT/BIC>"}
`.trim() : "";

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

Amount to Send: ${sendCur} ${amount}
Receiving Currency: ${recvCur} (converted by bank FX rate)
Fixed Receiving Bank Fee: USD ${feeUSD}

Payment Reference (include exactly): ${ref}

${intermediary ? intermediary + "\n" : ""}Notes: ${feeNote}
`.trim();

    const intent = await createDonationIntent({
      amount: Number(amount),
      currency: sendCur,            // send currency (donor’s)
      method: "swift",
      status: "issued_instructions",
      reference: ref,
      client_ip: ip,
      notes: "SWIFT instructions issued",
      // @ts-ignore meta saved in WP
      donor_name: donorName || "",
      // @ts-ignore
      donor_email: donorEmail || "",
      // @ts-ignore
      send_currency: sendCur,
      // @ts-ignore
      receive_currency: recvCur,
      // @ts-ignore
      fixed_fee_usd: feeUSD,
    } as any);

    // Fire-and-forget email (no await)
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
      amount: Number(amount),
      currency: sendCur,
      feeUSD,
      receiveCurrency: recvCur,
    }),
  }).catch(() => {});
} catch {}

// after you have { donorEmail, donorName, amount, currency, reference, instructions }
try {
  const base = process.env.SITE_URL || "http://localhost:3000";

  // Option 1: send without attachment (quick)
  await fetch(`${base}/api/notifications/email/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "swift",
      to: donorEmail,
      donorName,
      amount: Number(amount),
      currency,
      reference: ref,
    }),
  });

  // Option 2: send with attached PDF by calling your own /pdf route first
  // const pdfRes = await fetch(`${base}/api/payments/swift/pdf`, { ... });
  // const arr = await pdfRes.arrayBuffer();
  // await fetch(`${base}/api/notifications/email/receipt`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     type: "swift",
  //     to: donorEmail,
  //     donorName,
  //     amount: Number(amount),
  //     currency,
  //     reference: ref,
  //     swiftPdf: { data: Array.from(new Uint8Array(arr)) }
  //   }),
  // });
} catch {}

    return NextResponse.json({
      ok: true,
      instructions,
      reference: ref,
      amount: Number(amount),
      currency: sendCur,
      donorName: donorName || "",
      donorEmail: donorEmail || "",
      feeUSD,
      receiveCurrency: recvCur,
      intentId: intent?.id || null,
    });

  } catch (e: any) {

    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
