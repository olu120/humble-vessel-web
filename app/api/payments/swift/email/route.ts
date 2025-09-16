export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { donorEmail, donorName, instructions, reference, amount, currency, feeUSD, receiveCurrency } =
      await req.json();

    if (!donorEmail || !reference || !instructions) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // 1) Generate the same branded PDF by calling our own /pdf route
    const base = process.env.SITE_URL || "http://localhost:3000";
    const pdfRes = await fetch(`${base}/api/payments/swift/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donorEmail,
        donorName,
        amount,
        currency,
        reference,
        instructions,
        feeUSD,
        receiveCurrency,
      }),
    });
    if (!pdfRes.ok) {
      throw new Error("Failed to build PDF");
    }
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // 2) Send Mail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    const fromName = process.env.FROM_NAME || "Humble Vessel";
    const fromEmail = process.env.FROM_EMAIL || "no-reply@humblevessel.org";

    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: donorEmail,
      subject: `Your SWIFT Instructions – Ref ${reference}`,
      text:
`Hello ${donorName || "Donor"},

Thank you for your gift to Humble Vessel Foundation & Clinic.

Attached is your SWIFT transfer instruction PDF. Please include the payment reference exactly as shown.

If you have any issues, reply to this email or WhatsApp us.

With gratitude,
Humble Vessel`,
      attachments: [
        {
          filename: `HumbleVessel_SWIFT_${reference}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
