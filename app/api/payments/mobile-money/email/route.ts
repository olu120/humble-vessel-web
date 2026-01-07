// app/api/payments/mobile-money/email/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      donorEmail,
      donorName,
      amount,
      currency,
      reference,
      merchantCode,
      pdfBytesBase64, // optional but recommended
    } = data;

    if (!donorEmail || !reference) {
      return NextResponse.json(
        { ok: false, error: "Missing donorEmail/reference" },
        { status: 400 }
      );
    }

    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const safeMerchant = merchantCode || process.env.AIRTEL_MERCHANT_CODE || "6890724";
    const safeCurrency = currency || "UGX";
    const safeAmount = typeof amount === "number" ? amount : Number(amount || 0);

    const attachments: any[] = [];
    if (pdfBytesBase64) {
      attachments.push({
        filename: `HumbleVessel_Airtel_${reference}.pdf`,
        content: Buffer.from(String(pdfBytesBase64), "base64"),
        contentType: "application/pdf",
      });
    }

    await t.sendMail({
      from: `"Humble Vessel" <${process.env.FROM_EMAIL}>`,
      to: donorEmail,
      subject: `Your Airtel Money Instructions (Ref ${reference})`,
      text: `
Hello ${donorName || "Friend"},

Thank you for supporting Humble Vessel Foundation & Clinic.

Airtel Money (Merchant Pay) Instructions:
1) Dial *185# on your Airtel line
2) Choose Pay Bill / Merchant
3) Enter Merchant Code: ${safeMerchant}
4) Enter amount: ${safeCurrency} ${safeAmount}
5) Enter Payment Reference: ${reference}
6) Confirm and complete on your phone

We’ve attached a PDF copy (if available).

If you need help, reply to this email or WhatsApp us.

With gratitude,
Humble Vessel Foundation & Clinic
      `.trim(),
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
