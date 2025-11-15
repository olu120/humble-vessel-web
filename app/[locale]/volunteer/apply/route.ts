export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const wpBase =
      process.env.WP_URL?.replace(/\/$/, "") ||
      "https://cms.humblevesselfoundationandclinic.org";

    const url = `${wpBase}/wp-json/hv/v1/volunteer`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If later you add a shared secret, include it here as e.g. "X-HV-Token": process.env.HV_VOLUNTEER_TOKEN!
      },
      body: JSON.stringify({
        first: body.first,
        last: body.last,
        email: body.email,
        phone: body.phone,
        interest: body.interest,
        message: body.message,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error || `WP error ${res.status}`,
        },
        { status: 500 }
      );
    }

    // You can also trigger a separate thank-you email here if you like

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
