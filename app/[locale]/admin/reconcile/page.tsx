"use client";

import React, { useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";

type ToastKind = "success" | "error" | "info";

function Toast({
  kind = "info",
  message,
  onClose,
}: {
  kind?: ToastKind;
  message: string;
  onClose?: () => void;
}) {
  // auto-dismiss after 5s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  const colors =
    kind === "success"
      ? "bg-green-600"
      : kind === "error"
      ? "bg-red-600"
      : "bg-slate-700";

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-4 -translate-x-1/2 z-50 rounded-lg px-4 py-2 text-white shadow-lg ${colors}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm">{message}</span>
        <button
          className="text-sm underline text-white/80 hover:text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

type Intent = {
  id: number;
  title?: { rendered: string };
  meta?: Record<string, any>;
};

export default function ReconcilePage() {
  const [token, setToken] = useState<string>("");
  const [method, setMethod] = useState<"" | "swift" | "mobile_money">("");
  const [status, setStatus] = useState<string>("pending");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Intent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toastMsg, setToastMsg] = useState("");
  const [toastKind, setToastKind] = useState<ToastKind>("info");
  const showToast = (msg: string, kind: ToastKind = "info") => {
    setToastKind(kind);
    setToastMsg(msg);
  }

  // read-only detection (simple heuristic by storing audit token client-side)
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem("hv_admin_token");
    if (t) setToken(t);
  }, []);
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("hv_admin_token", token);
      // Optional: store the AUDIT token in an env-exposed public var to compare.
      // If you prefer not to expose, we simply infer readOnly by a failed update attempt.
      const publicAuditToken = process.env.NEXT_PUBLIC_AUDIT_TOKEN; // optional
      if (publicAuditToken && token === publicAuditToken) setReadOnly(true);
    }
  }, [token]);

  const fetchList = async (p = page) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL("/api/admin/intents/list", window.location.origin);
      if (method) url.searchParams.set("method", method);
      if (status) url.searchParams.set("status", status);
      if (search) url.searchParams.set("search", search);
      url.searchParams.set("page", String(p));
      url.searchParams.set("perPage", "200");

      const res = await fetch(url.toString(), {
        headers: { "x-admin-token": token },
      });
      const data = await res.json();
      if (data?.ok) {
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
        setPage(p);
      } else {
        alert(data?.error || "Failed to load.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const updateIntent = async (id: number, patch: any) => {
    if (!token) return;
    if (readOnly) return; // guard in UI
    const res = await fetch("/api/admin/intents/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!data?.ok) {
      // If this happens, you might be using the audit token.
      if (data?.error === "Unauthorized") {
        setReadOnly(true);
        alert("This token is read-only. Updates are disabled.");
      } else {
        alert(data?.error || "Update failed");
      }
    } else {
      fetchList(page);
    }
  };

 const exportCsv = async () => {
  if (!token) return;
  try {
    const url = new URL("/api/admin/intents/list", window.location.origin);
    if (method) url.searchParams.set("method", method);
    if (status) url.searchParams.set("status", status);
    if (search) url.searchParams.set("search", search);
    url.searchParams.set("page", "1");
    url.searchParams.set("perPage", "100"); // API paginates internally
    url.searchParams.set("format", "csv");

    const res = await fetch(url.toString(), {
      headers: { "x-admin-token": token },
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      showToast(j?.error || "Export failed", "error");
      return;
    }

    const count = res.headers.get("X-Export-Count");
    const pages = res.headers.get("X-Export-Pages");

    const blob = await res.blob();
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;

    const cd = res.headers.get("Content-Disposition");
    const match = cd?.match(/filename="([^"]+)"/i);
    a.download = match?.[1] || "donation_intents_export.csv";
    a.click();
    URL.revokeObjectURL(urlBlob);

    if (count && pages) {
      showToast(`Exported ${count} rows across ${pages} page(s).`, "success");
    } else if (count) {
      showToast(`Exported ${count} rows.`, "success");
    } else {
      showToast("Export complete.", "success");
    }
  } catch {
    showToast("Export failed", "error");
  }
};


  const rows = useMemo(() => {
    return items.map((it) => {
      const m = it.meta || {};
      const ref = m.reference || "";
      const amt = m.amount ? Number(m.amount).toLocaleString() : "";
      const cur = m.currency || "";
      const meth = m.method || "";
      const stat = m.status || "";
      const sendCur = m.send_currency || "";
      const recvCur = m.receive_currency || "";
      const donorEmail = m.donor_email || "";
      const merchantCode = m.merchant_code || "";
      const receivedUgx = m.received_ugx || "";
      const bankTxRef = m.bank_tx_ref || "";
      const notes = m.notes || "";

      return (
        <tr key={it.id} className="border-b">
          <td className="px-2 py-2 text-sm">{it.id}</td>
          <td className="px-2 py-2 text-sm">{ref}</td>
          <td className="px-2 py-2 text-sm">{cur} {amt}</td>
          <td className="px-2 py-2 text-sm">{meth}</td>
          <td className="px-2 py-2 text-sm">{stat}</td>
          <td className="px-2 py-2 text-sm">{sendCur}</td>
          <td className="px-2 py-2 text-sm">{recvCur}</td>
          <td className="px-2 py-2 text-sm">{donorEmail}</td>
          <td className="px-2 py-2 text-sm">{merchantCode}</td>
          <td className="px-2 py-2">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  placeholder="Received UGX"
                  defaultValue={receivedUgx}
                  className="w-32 px-2 py-1 text-sm border rounded"
                  disabled={readOnly}
                  onBlur={(e) => !readOnly && updateIntent(it.id, { received_ugx: Number(e.target.value || 0) })}
                />
                <input
                  placeholder="Bank Tx Ref"
                  defaultValue={bankTxRef}
                  className="w-40 px-2 py-1 text-sm border rounded"
                  disabled={readOnly}
                  onBlur={(e) => !readOnly && updateIntent(it.id, { bank_tx_ref: e.target.value })}
                />
                <select
                  defaultValue={stat}
                  className="px-2 py-1 text-sm border rounded"
                  disabled={readOnly}
                  onChange={(e) => updateIntent(it.id, { status: e.target.value })}
                >
                  <option value="">(status)</option>
                  <option value="pending">pending</option>
                  <option value="initiated">initiated</option>
                  <option value="issued_instructions">issued_instructions</option>
                  <option value="succeeded">succeeded</option>
                  <option value="failed">failed</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <textarea
                placeholder="Internal notes…"
                defaultValue={notes}
                className="h-16 px-2 py-1 text-sm border rounded w-80"
                disabled={readOnly}
                onBlur={(e) => !readOnly && updateIntent(it.id, { notes: e.target.value })}
              />
            </div>
          </td>
        </tr>
      );
    });
  }, [items, readOnly]);

  return (
    <main className="p-6">
        <Toast message={toastMsg} kind={toastKind} onClose={() => setToastMsg("")} />
      <h1 className="mb-4 text-2xl font-semibold">Donation Reconciliation</h1>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs">Admin Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="px-3 py-2 border rounded"
            placeholder="Enter token"
          />
          {readOnly && (
            <div className="mt-1 text-xs text-amber-600">
              Read-only mode (auditor token)
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="px-3 py-2 border rounded">
            <option value="">All</option>
            <option value="swift">SWIFT</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
        </div>
        <div>
          <label className="block text-xs">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">All</option>
            <option value="pending">pending</option>
            <option value="initiated">initiated</option>
            <option value="issued_instructions">issued_instructions</option>
            <option value="succeeded">succeeded</option>
            <option value="failed">failed</option>
            <option value="completed">completed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs">Search (Reference)</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border rounded" placeholder="HV-..." />
        </div>
        <button
          onClick={() => fetchList(1)}
          className="px-4 py-2 text-white bg-black rounded disabled:opacity-50"
          disabled={!token || loading}
        >
          {loading ? "Loading…" : "Load"}
        </button>

        <button
          onClick={exportCsv}
          className="px-4 py-2 border rounded disabled:opacity-50"
          disabled={!token || loading}
          title="Exports the currently filtered results"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-[1000px] w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left">ID</th>
              <th className="px-2 py-2 text-left">Reference</th>
              <th className="px-2 py-2 text-left">Amount</th>
              <th className="px-2 py-2 text-left">Method</th>
              <th className="px-2 py-2 text-left">Status</th>
              <th className="px-2 py-2 text-left">Send</th>
              <th className="px-2 py-2 text-left">Receive</th>
              <th className="px-2 py-2 text-left">Email</th>
              <th className="px-2 py-2 text-left">Merchant</th>
              <th className="px-2 py-2 text-left">Reconcile</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button className="px-3 py-1 border rounded" disabled={page <= 1} onClick={() => fetchList(page - 1)}>
          Prev
        </button>
        <span className="text-sm">Page {page} / {totalPages}</span>
        <button className="px-3 py-1 border rounded" disabled={page >= totalPages} onClick={() => fetchList(page + 1)}>
          Next
        </button>
      </div>
    </main>
  );
}
