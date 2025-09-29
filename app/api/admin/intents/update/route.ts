export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { wpUpdateIntentMeta } from "@/lib/wp-intents-admin";

function ok(req: Request) {
  const token = req.headers.get("x-admin-token") || "";
  return token && token === process.env.RECONCILE_TOKEN; // auditors cannot update
}

export async function POST(req: Request) {
  try {
    if (!ok(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id, status, received_ugx, bank_tx_ref, notes } = await req.json();

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const patch: Record<string, any> = {};
    if (status) patch["status"] = String(status);
    if (received_ugx !== undefined) patch["received_ugx"] = Number(received_ugx);
    if (bank_tx_ref !== undefined) patch["bank_tx_ref"] = String(bank_tx_ref);
    if (notes !== undefined) patch["notes"] = String(notes);

    const updated = await wpUpdateIntentMeta(Number(id), patch);
    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
