import { NextResponse } from "next/server";
import { createDonationIntent, updateDonationIntent } from "@/lib/wp-intents";

export async function POST(req: Request) {
  try {
    const { amount, currency, phone, network } = await req.json();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "";

    if (!amount || !currency || !phone || !network) {
      return NextResponse.json({ ok:false, error:"Missing fields" }, { status: 400 });
    }

    // 1) Create intent in WP (pending)
    const intent = await createDonationIntent({
      amount: Number(amount),
      currency,
      method: "mobile_money",
      status: "pending",
      phone,
      network,
      client_ip: ip,
      reference: `MOMO-${Date.now()}`,
    });

    // 2) If gateway not configured, mark as failed (still logged)
    if (!process.env.MOMO_API_BASE || !process.env.MOMO_API_KEY) {
      await updateDonationIntent(intent.id, { status: "failed", notes: "Gateway not configured" });
      return NextResponse.json({ ok:false, reference:intent.meta?.reference });
    }

    // 3) TODO: Replace with real provider call
    // const res = await fetch(`${process.env.MOMO_API_BASE}/collect`, { ... });
    // const data = await res.json();
    // const success = data?.success;

    const success = true; // mock while integrating

    // 4) Update intent status
    await updateDonationIntent(intent.id, { status: success ? "initiated" : "failed" });

    return NextResponse.json({ ok: success, reference: intent.meta?.reference });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
