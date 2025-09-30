export const runtime = "nodejs";
import { NextResponse } from "next/server";

const AUDITOR_TOKEN = process.env.AUDITOR_TOKEN || "";

function absoluteBase(req: Request) {
  const host = req.headers.get("host")!;
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!AUDITOR_TOKEN || auth !== `Bearer ${AUDITOR_TOKEN}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { method, reference, email, donorName } = body as {
      method: "swift" | "mobile_money";
      reference: string;
      email: string;
      donorName?: string;
    };

    if (!method || !reference || !email) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const base = absoluteBase(req);

    if (method === "mobile_money") {
      // 1) Rebuild Airtel PDF
      const pdfRes = await fetch(`${base}/api/payments/mobile-money/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      if (!pdfRes.ok) throw new Error("PDF generation failed");
      const buf = await pdfRes.arrayBuffer();
      const pdfBase64 = Buffer.from(buf).toString("base64");

      // 2) Email it
      const mailRes = await fetch(`${base}/api/payments/mobile-money/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorEmail: email,
          reference,
          pdfBytesBase64: pdfBase64,
        }),
      });
      if (!mailRes.ok) throw new Error("Email sending failed");

      return NextResponse.json({ ok: true });
    }

    // SWIFT
    const pdfRes = await fetch(`${base}/api/payments/swift/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Minimal payload; your SWIFT/pdf route will fill bank info server-side
      body: JSON.stringify({ reference }),
    });
    if (!pdfRes.ok) throw new Error("PDF generation failed");
    const buf = await pdfRes.arrayBuffer();
    const pdfBase64 = Buffer.from(buf).toString("base64");

    const mailRes = await fetch(`${base}/api/payments/swift/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donorEmail: email,
        donorName: donorName || "",
        reference,
        pdfBytesBase64: pdfBase64,
      }),
    });
    if (!mailRes.ok) throw new Error("Email sending failed");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
