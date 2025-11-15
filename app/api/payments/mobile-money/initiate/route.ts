export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents";

type Cadence = "one_time" | "weekly" | "biweekly" | "monthly";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      amount?: number | string;
      currency?: string;
      phone?: string;
      network?: "mtn" | "airtel";
      donorEmail?: string;
      cadence?: Cadence; // <-- new
    };

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "";

    const amount = Number(body?.amount ?? 0);
    const currency = String(body?.currency || "UGX");
    const phone = String(body?.phone || "");
    const network = (body?.network || "airtel") as "mtn" | "airtel";
    const donorEmail = (body?.donorEmail || "").trim();
    const cadence: Cadence = (body?.cadence as Cadence) || "one_time"; // <-- default

    if (!amount || !currency) {
      return NextResponse.json({ ok: false, error: "Missing amount/currency" }, { status: 400 });
    }

    const ref = `${process.env.MOBILE_REFERENCE_PREFIX || "HV-MM-"}${Date.now()}`;

    const intent = await createDonationIntent({
      amount,
      currency,
      method: "mobile_money",
      status: "pending",
      reference: ref,
      client_ip: ip,
      // extra meta saved into WP:
      // @ts-ignore meta fields
      phone,
      // @ts-ignore
      network,
      // @ts-ignore
      donor_email: donorEmail || "",
      // @ts-ignore
      recurring_cadence: cadence, // <-- save it
      // you can also store merchant_code if you wish
      // @ts-ignore
      merchant_code: process.env.AIRTEL_MERCHANT_CODE || "6890724",
      // @ts-ignore
      notes: "Airtel Merchant payment initiated (offline)",
    } as any);

    return NextResponse.json({
      ok: true,
      intentId: intent?.id || null,
      reference: ref,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
