import { NextResponse } from "next/server";
import { createDonationIntent } from "@/lib/wp-intents";

export async function GET() {
  try {
    const data = await createDonationIntent({
      amount: 123,
      currency: "UGX",
      method: "mobile_money",
      status: "pending",
      reference: `TEST-${Date.now()}`,
    });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
