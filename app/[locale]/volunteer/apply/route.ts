// app/api/volunteer/submit/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type AnyObj = Record<string, unknown>;

function str(v: unknown): string {
  return (v ?? "").toString().trim();
}

export async function POST(req: Request) {
  try {
    // Accept JSON or x-www-form-urlencoded (just in case)
    let body: AnyObj = {};
    const ctype = req.headers.get("content-type") || "";

    if (ctype.includes("application/json")) {
      body = await req.json();
    } else if (ctype.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      form.forEach((v, k) => (body[k] = v));
    } else {
      // Try JSON anyway; fail softly
      try { body = await req.json(); } catch { body = {}; }
    }

    // Normalize ALL expected aliases from the client
    const firstname =
      str(body.firstname ?? body.first_name ?? body.firstName);
    const lastname =
      str(body.lastname ?? body.last_name ?? body.lastName);
    const email = str(body.email);
    const phone = str(body.phone);
    const interestedarea =
      str(body.interestedarea ?? body.interest_area ?? body.interestArea);
    const message = str(body.message);

    // Build the canonical payload for Apps Script:
    // timestamp is added by Apps Script; we only send these keys.
    const payload = {
      firstname,
      lastname,
      email,
      phone,
      interestedarea,
      message,
    };

    const url = process.env.GSHEET_WEBAPP_URL;
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "GSHEET_WEBAPP_URL not set" },
        { status: 500 }
      );
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send JSON exactly as your Apps Script expects
      body: JSON.stringify(payload),
      // No CORS flags needed; this is server-to-server
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON from Apps Script", raw: text },
        { status: 502 }
      );
    }

    if (!res.ok || !data?.ok) {
      return NextResponse.json(
        { ok: false, error: data?.error || `Sheet error ${res.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
