export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { wpListIntents, IntentItem } from "@/lib/wp-intents-admin";

function isAuthorized(req: Request) {
  const token = req.headers.get("x-admin-token") || "";
  return token && (token === process.env.RECONCILE_TOKEN || token === process.env.AUDIT_TOKEN);
}

function toCsv(items: IntentItem[]) {
  const headers = [
    "id",
    "reference",
    "method",
    "status",
    "amount",
    "currency",
    "send_currency",
    "receive_currency",
    "donor_email",
    "merchant_code",
    "received_ugx",
    "bank_tx_ref",
    "notes",
    "created_at",
    "modified_at",
  ];

  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [headers.join(",")];

  for (const it of items) {
    const m = it.meta || {};
    const row = [
      it.id,
      m.reference || "",
      m.method || "",
      m.status || "",
      m.amount ?? "",
      m.currency || "",
      m.send_currency || "",
      m.receive_currency || "",
      m.donor_email || "",
      m.merchant_code || "",
      m.received_ugx ?? "",
      m.bank_tx_ref || "",
      m.notes || "",
      it.date || "",
      it.modified || "",
    ].map(esc);
    lines.push(row.join(","));
  }

  return lines.join("\n");
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const method = searchParams.get("method") as "swift" | "mobile_money" | null;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const perPage = Number(searchParams.get("perPage") || "200"); // allow larger pulls
    const format = searchParams.get("format"); // "csv" or undefined

    const { items, total, totalPages } = await wpListIntents({
      method: (method ?? undefined) as any,
      status,
      search,
      page,
      perPage,
    });

    if (format === "csv") {
  let all: IntentItem[] = [];
  let pageNum = 1;
  let lastTotalPages = 1;

  while (true) {
    const { items, totalPages } = await wpListIntents({
      method: (method ?? undefined) as any,
      status,
      search,
      page: pageNum,
      perPage: 100, // WordPress max
    });
    all = all.concat(items);
    lastTotalPages = totalPages;
    if (pageNum >= totalPages) break;
    pageNum++;
  }

  const csv = toCsv(all);
  const count = all.length;
  const pages = lastTotalPages;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      // Put the count into the filename so it's visible right away
      "Content-Disposition": `attachment; filename="donation_intents_export_${count}.csv"`,
      // Also include explicit headers the client can read for a toast
      "X-Export-Count": String(count),
      "X-Export-Pages": String(pages),
    },
  });
}



    return NextResponse.json({ ok: true, items, total, totalPages });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
