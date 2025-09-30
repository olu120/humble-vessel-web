export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { wpListIntents, IntentItem } from "@/lib/wp-intents-admin";
import { assertAdmin } from "@/lib/admin-auth";

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
    // ✅ If this throws, we’ll catch and send JSON (not HTML)
    await assertAdmin();

    const { searchParams } = new URL(req.url);
    const method = searchParams.get("method") as "swift" | "mobile_money" | null;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    // Respect WP max=100; we’ll paginate when CSV below
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage") || "50")));
    const format = searchParams.get("format"); // "csv" or undefined

    const { items, total, totalPages } = await wpListIntents({
      method: (method ?? undefined) as any,
      status,
      search,
      page,
      perPage,
    });

    if (format === "csv") {
      // Pull all pages when CSV
      let all: IntentItem[] = [];
      let pageNum = 1;
      let lastTotalPages = 1;

      while (true) {
        const { items, totalPages } = await wpListIntents({
          method: (method ?? undefined) as any,
          status,
          search,
          page: pageNum,
          perPage: 100,
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
          "Content-Disposition": `attachment; filename="donation_intents_export_${count}.csv"`,
          "X-Export-Count": String(count),
          "X-Export-Pages": String(pages),
        },
      });
    }

    return NextResponse.json({ ok: true, items, total, totalPages });
  } catch (e: any) {
    const msg = e?.message || "Unknown error";
    const status = e?.statusCode && Number.isInteger(e.statusCode) ? e.statusCode : 500;

    // ✅ Always send JSON on errors
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
