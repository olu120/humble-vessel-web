export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents";

type Cadence = "one_time" | "weekly" | "biweekly" | "monthly";

function absoluteBase(req: Request) {
  const host = req.headers.get("host")!;
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      amount?: number | string;
      currency?: string;
      phone?: string;
      network?: "mtn" | "airtel";
      donorEmail?: string;
      donorName?: string;
      cadence?: Cadence;
    };

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "";

    const amount = Number(body?.amount ?? 0);
    const currency = String(body?.currency || "UGX");
    const phone = String(body?.phone || "");
    const network = (body?.network || "airtel") as "mtn" | "airtel";
    const donorEmail = (body?.donorEmail || "").trim();
    const donorName = (body?.donorName || "").trim();
    const cadence: Cadence = (body?.cadence as Cadence) || "one_time";

    if (!amount || !currency) {
      return NextResponse.json({ ok: false, error: "Missing amount/currency" }, { status: 400 });
    }

    const ref = `${process.env.MOBILE_REFERENCE_PREFIX || "HV-MM-"}${Date.now()}`;
    const merchantCode = process.env.AIRTEL_MERCHANT_CODE || "6890724";

    const intent = await createDonationIntent({
      amount,
      currency,
      method: "mobile_money",
      status: "pending",
      reference: ref,
      client_ip: ip,

      phone,
      network,
      donor_email: donorEmail || "",
      donor_name: donorName || "",
      recurring_cadence: cadence,
      merchant_code: merchantCode,
      notes: "Airtel Merchant payment initiated (offline)",
    } as any);

    // ✅ Email local instructions + PDF ONCE from server
    if (donorEmail) {
      const base = absoluteBase(req);

      // 1) Generate PDF
      const pdfRes = await fetch(`${base}/api/payments/mobile-money/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantCode,
          reference: ref,
          amount,
          currency,
        }),
      });

      if (pdfRes.ok) {
        const buf = await pdfRes.arrayBuffer();
        const pdfBase64 = Buffer.from(buf).toString("base64");

        // 2) Send email
        await fetch(`${base}/api/payments/mobile-money/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donorEmail,
            donorName,
            amount,
            currency,
            reference: ref,
            merchantCode,
            pdfBytesBase64: pdfBase64,
          }),
        });
      } else {
        // Even if PDF fails, send a basic email (no attachment)
        await fetch(`${base}/api/payments/mobile-money/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donorEmail,
            donorName,
            amount,
            currency,
            reference: ref,
            merchantCode,
          }),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      intentId: intent?.id || null,
      reference: ref,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
