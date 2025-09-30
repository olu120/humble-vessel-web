"use client";

import React, { useEffect, useMemo, useState } from "react";

/** Shape we render in the table (normalized from API) */
type Row = {
  id: number;
  reference: string;
  method: "mobile_money" | "swift" | string;
  status: string;
  amount: number | null;
  currency: string | null;
  send_currency?: string | null;
  receive_currency?: string | null;
  donor_email?: string | null;
  merchant_code?: string | null;
  received_ugx?: number | null;
  bank_tx_ref?: string | null;
  notes?: string | null;
  created_at?: string | null;
  modified_at?: string | null;
};

type ApiListResponse = {
  ok: true;
  items: Array<{
    id: number;
    date?: string;
    modified?: string;
    meta?: Record<string, any>;
  }>;
  total: number;
  totalPages: number;
};

export default function ReconcileClient({ locale }: { locale: "en" | "lg" }) {
  // ---------------- State
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filters / paging
  const [method, setMethod] = useState<"" | "mobile_money" | "swift">("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(50);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const t = useMemo(() => {
    // super-light i18n for a few labels
    const en = {
      title: "Reconcile",
      refresh: "Refresh",
      exportCsv: "Export CSV",
      reference: "Reference",
      amount: "Amount",
      method: "Method",
      status: "Status",
      email: "Email",
      created: "Created",
      actions: "Actions",
      resend: "Resend instructions",
      none: "No rows",
      filterMethod: "Method",
      filterStatus: "Status",
      filterSearch: "Search",
      mobileMoney: "Mobile Money",
      swift: "SWIFT",
      all: "All",
      loading: "Loading…",
    };
    const lg = {
      title: "Okugattako ensasula (Reconcile)",
      refresh: "Okuddamu Okujjuzza",
      exportCsv: "Senda CSV",
      reference: "Payment Reference",
      amount: "Omuwendo",
      method: "Ekika",
      status: "Embeera",
      email: "Email",
      created: "Obutandisi bwa record",
      actions: "Ebikolwa",
      resend: "Ddamu osindike ebyokukulembeza",
      none: "Tewali bipande",
      filterMethod: "Ekika",
      filterStatus: "Embeera",
      filterSearch: "Noonya",
      mobileMoney: "Mobile Money",
      swift: "SWIFT",
      all: "Byonna",
      loading: "Okujjuzza…",
    };
    return locale === "lg" ? lg : en;
  }, [locale]);

  // ---------------- Helpers
  function paramsForList(): URLSearchParams {
    const p = new URLSearchParams();
    if (method) p.set("method", method);
    if (status) p.set("status", status);
    if (search) p.set("search", search);
    p.set("page", String(page));
    p.set("perPage", String(perPage));
    return p;
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/reconcile/list?${paramsForList().toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      const ct = res.headers.get("content-type") || "";

      if (!res.ok) {
        if (ct.includes("application/json")) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `Request failed (${res.status})`);
        } else {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Request failed (${res.status})`);
        }
      }

      if (!ct.includes("application/json")) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          "Server responded with non-JSON content.\n" + txt.slice(0, 300)
        );
      }

      const data = (await res.json()) as ApiListResponse | { ok: false; error: string };
      if (!("ok" in data) || !data.ok) {
        const errMsg = (data as any)?.error || "Unknown server error";
        throw new Error(errMsg);
      }

      // Normalize rows
      const normalized: Row[] = data.items.map((it) => {
        const m = it.meta || {};
        return {
          id: it.id,
          reference: m.reference || "",
          method: (m.method || "") as any,
          status: m.status || "",
          amount: typeof m.amount === "number" ? m.amount : Number(m.amount ?? NaN) || null,
          currency: m.currency || null,
          send_currency: m.send_currency || null,
          receive_currency: m.receive_currency || null,
          donor_email: m.donor_email || null,
          merchant_code: m.merchant_code || null,
          received_ugx: typeof m.received_ugx === "number" ? m.received_ugx : Number(m.received_ugx ?? NaN) || null,
          bank_tx_ref: m.bank_tx_ref || null,
          notes: m.notes || null,
          created_at: it.date || "",
          modified_at: it.modified || "",
        };
      });

      setRows(normalized);
      setTotal((data as ApiListResponse).total);
      setTotalPages((data as ApiListResponse).totalPages);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

 

  // CSV export (streams all pages server-side)
  async function exportCsv() {
    try {
      const p = paramsForList();
      p.set("format", "csv");
      const url = `/api/admin/reconcile/list?${p.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);

      const blob = await res.blob();
      const countHeader = res.headers.get("X-Export-Count") || "";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `donation_intents_export_${countHeader || "all"}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      alert(e?.message || "Export failed");
    }
  }

  // load on first mount + whenever filters/page change
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, status, page, perPage]); // search will be applied via 'Apply' button

  // ---------------- UI
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{t.title}</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 border rounded-xl p-3">
        <div>
          <label className="block text-xs mb-1">{t.filterMethod}</label>
          <select
            className="border rounded-md px-2 py-1"
            value={method}
            onChange={(e) => {
              setPage(1);
              setMethod(e.target.value as any);
            }}
          >
            <option value="">{t.all}</option>
            <option value="mobile_money">{t.mobileMoney}</option>
            <option value="swift">{t.swift}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1">{t.filterStatus}</label>
          <input
            className="border rounded-md px-2 py-1"
            placeholder="e.g. pending / issued_instructions"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          />
        </div>

        <div className="grow min-w-[200px]">
          <label className="block text-xs mb-1">{t.filterSearch}</label>
          <input
            className="w-full border rounded-md px-2 py-1"
            placeholder="reference, email, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                void load();
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 border rounded-md" onClick={() => { setPage(1); void load(); }}>
            {t.refresh}
          </button>
          <button className="px-3 py-2 border rounded-md" onClick={exportCsv}>
            {t.exportCsv}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs">Per page</label>
          <select
            className="border rounded-md px-2 py-1"
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(Number(e.target.value) || 50);
            }}
          >
            {[25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error / Loading */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-md border p-3 text-sm">{t.loading}</div>
      )}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">{t.reference}</th>
                <th className="p-2 text-left">{t.amount}</th>
                <th className="p-2 text-left">{t.method}</th>
                <th className="p-2 text-left">{t.status}</th>
                <th className="p-2 text-left">{t.email}</th>
                <th className="p-2 text-left">{t.created}</th>
                <th className="p-2 text-left">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 font-mono">{r.reference}</td>
                  <td className="p-2">
                    {(r.currency || "")}{" "}
                    {typeof r.amount === "number" ? r.amount : r.amount ?? ""}
                  </td>
                  <td className="p-2">{r.method}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">{r.donor_email || "-"}</td>
                  <td className="p-2">{r.created_at || "-"}</td>
                 
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center opacity-70" colSpan={7}>
                    {t.none}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <div>
            Page {page} of {totalPages} • {total} total
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-md disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <button
              className="px-3 py-1 border rounded-md disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
