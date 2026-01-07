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

    // MOBILE MONEY: resend via receipt route (local)
    if (method === "mobile_money") {
      const mailRes = await fetch(`${base}/api/notifications/email/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "local",
          to: email,
          donorName: donorName || "",
          amount: 0,          // optional if your template needs it; ideally fetch from WP
          currency: "UGX",     // optional; ideally fetch from WP
          reference,
          merchantCode: process.env.AIRTEL_MERCHANT_CODE || "6890724",
        }),
      });

      if (!mailRes.ok) throw new Error("Email sending failed");
      return NextResponse.json({ ok: true });
    }

    // SWIFT: resend via swift/email (it regenerates pdf internally)
    const mailRes = await fetch(`${base}/api/payments/swift/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donorEmail: email,
        donorName: donorName || "",
        reference,
      }),
    });

    if (!mailRes.ok) throw new Error("Email sending failed");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
