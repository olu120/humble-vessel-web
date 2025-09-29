"use client";

import React, { Suspense, useState, type JSX } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Section from "@/components/Section";
import Button from "@/components/Button";

function CheckoutInner(): JSX.Element {
  const sp = useSearchParams(); // Suspense-safe
  const pathname = usePathname() || "/en";
  const locale = (pathname.split("/")[1] || "en") as "en" | "lg";

  const tab = (sp.get("tab") as "local" | "intl") || "local";
  const amount = Number(sp.get("amount") || 0);

  // Local (Mobile Money)
  const [phone, setPhone] = useState<string>("");
  const [network, setNetwork] = useState<"" | "mtn" | "airtel">("");

  // Intl (SWIFT)
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");

  // Allowed send currencies (public env → client)
  const allowedFromEnv =
    (process.env.NEXT_PUBLIC_SWIFT_ALLOWED_SEND_CURRENCIES || "USD,EUR,GBP")
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
  const allowed = allowedFromEnv.length ? allowedFromEnv : ["USD", "EUR", "GBP"];
  const [sendCurrency, setSendCurrency] = useState<string>(allowed[0]);

  const [loading, setLoading] = useState(false);

  const proceed = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);

    // -------- LOCAL (UGX / Mobile Money) --------
  // LOCAL (Airtel Merchant)
if (tab === "local") {
  const res = await fetch("/api/payments/mobile-money/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "UGX",
      network: "airtel",
      merchantCode: "6890724",
      method: "mobile_money",
    }),
  });
  const data = await res.json();

  if (data?.ok) {
    try {
      sessionStorage.setItem(
        "hv_last_local_payload",
        JSON.stringify({
          method: "mobile_money",
          network: "airtel",
          merchantCode: "6890724",
          amount,
          currency: "UGX",
          reference: data.reference,
        })
      );
    } catch {}

    window.location.href =
      `/${locale}/donate/donate-success?method=mm&ref=${encodeURIComponent(data.reference || "")}`;
  } else {
    window.location.href = `/${locale}/donate/donate-cancel`;
  }
  return;
}


    // -------- INTERNATIONAL (SWIFT) --------
    if (!donorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      alert("Please enter a valid email for your receipt/PDF.");
      setLoading(false);
      return;
    }
    if (!amount || amount < 100) {
      alert(`International donations must be at least 100 ${sendCurrency}.`);
      setLoading(false);
      return;
    }

    // Create SWIFT instructions + log intent
    const res = await fetch("/api/payments/swift/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: sendCurrency, // donor-selected currency
        donorName,
        donorEmail,
      }),
    });
    const data = await res.json();

    if (data?.instructions && data?.reference) {
  try {
    sessionStorage.setItem(
      "hv_last_swift_payload",
      JSON.stringify({
        method: "swift",
        donorName,
        donorEmail,
        amount,
        currency: "USD",
        reference: data.reference,
        instructions: data.instructions,
        feeUSD: data.feeUSD,
        receiveCurrency: data.receiveCurrency || "UGX",
          })
        );

        // Generate branded PDF (server) and download client-side
        const resPdf = await fetch("/api/payments/swift/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: sessionStorage.getItem("hv_last_swift_payload")!,
        });

        if (resPdf.ok) {
          const blob = await resPdf.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `HumbleVessel_SWIFT_${data.reference}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch {
        // ignore; we'll still take donor to success page
      }

      // pass ref to success page (handy for support)
       window.location.href =
    `/${locale}/donate/donate-success?method=swift&ref=${encodeURIComponent(data.reference)}`;
} else {
  window.location.href = `/${locale}/donate/donate-cancel`;
}
  };

  return (
    <main>
      <Section title="Confirm your donation">
        <div className="max-w-xl p-6 border rounded-2xl">
          <div className="mb-4">
            <p className="text-sm opacity-80">Donation type</p>
            <p className="text-lg font-medium">
              {tab === "intl" ? "International" : "Local (UGX)"}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm opacity-80">Amount</p>
            <p className="text-2xl font-semibold">
              {tab === "intl"
                ? `${sendCurrency} ${amount.toLocaleString()}`
                : `UGX ${amount.toLocaleString()}`}
            </p>
            {tab === "intl" && (
              <p className="mt-1 text-xs opacity-70">
                Minimum 100 due to the receiving bank’s USD 100 fee.
              </p>
            )}
          </div>

          {tab === "local" && (
  <div className="mb-6 space-y-3">
    <div className="px-4 py-3 border rounded-2xl bg-green-50">
      <p className="mb-1 font-medium">Pay with Airtel (Merchant Code)</p>
      <ul className="ml-5 space-y-1 text-sm list-disc">
        <li>Open your phone and dial <b>*185#</b>.</li>
        <li>Choose <b>Pay Bill / Merchant</b>.</li>
        <li>Enter Merchant Code: <b>6890724</b>.</li>
        <li>Enter Amount: <b>UGX {amount.toLocaleString()}</b>.</li>
        <li>Enter <b>Payment Reference</b> (we’ll show it after you proceed).</li>
        <li>Confirm the payment on your phone.</li>
      </ul>
      <p className="mt-2 text-xs opacity-70">
        Tip: Please keep your transaction SMS/receipt for records.
      </p>
    </div>
  </div>
)}

          {tab === "intl" && (
            <div className="mb-6 space-y-3">
              <div>
                <label className="block mb-1 text-sm">Donor name</label>
                <input
                  className="w-full px-4 py-2 border rounded-2xl"
                  placeholder="Full name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Donor email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-2xl"
                  placeholder="you@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
              </div>

              {/* Send-currency selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm">Send currency</label>
                  <select
                    className="w-full px-3 py-2 border rounded-2xl"
                    value={sendCurrency}
                    onChange={(e) => setSendCurrency(e.target.value)}
                  >
                    {allowed.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fees & conversion note */}
              <div className="px-4 py-3 text-sm border rounded-xl bg-yellow-50">
                <p className="mb-1">
                  <strong>Important:</strong>
                </p>
                <ul className="ml-5 space-y-1 list-disc">
                  <li>
                    You can send in your local currency (
                    <strong>{allowed.join(", ")}</strong>).
                  </li>
                  <li>
                    The receiving bank <strong>credits in UGX</strong> at its FX
                    rate.
                  </li>
                  <li>
                    A <strong>flat USD 100</strong> receiving bank fee is
                    deducted on arrival.
                  </li>
                  <li>
                    Please include the <strong>Payment Reference</strong>{" "}
                    exactly as shown in the PDF.
                  </li>
                </ul>
              </div>
            </div>
          )}

          <Button onClick={proceed} disabled={loading}>
            {loading ? "Processing…" : "Proceed"}
          </Button>
        </div>
      </Section>
    </main>
  );
}

export default function DonateCheckoutPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="p-6">Loading checkout…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
