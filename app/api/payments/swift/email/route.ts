// app/api/payments/swift/email/route.ts
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
      instructions,
      feeUSD,
      receiveCurrency,
    } = data;

    const base = process.env.SITE_URL || "http://localhost:3000";

    // Generate PDF from the same endpoint the UI uses
    const pdfRes = await fetch(`${base}/api/payments/swift/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

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

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
