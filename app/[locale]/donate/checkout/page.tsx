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
    if (tab === "local") {
      if (!phone || !network) {
        alert("Enter phone and choose network.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/payments/mobile-money/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "UGX", phone, network }),
      });
      const data = await res.json();
      window.location.href = data?.ok
        ? `/${locale}/donate/donate-success`
        : `/${locale}/donate/donate-cancel`;
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
        // Save payload for "Download again" on success page
        sessionStorage.setItem(
          "hv_last_swift_payload",
          JSON.stringify({
            instructions: data.instructions,
            reference: data.reference,
            donorName: data.donorName || donorName,
            donorEmail: data.donorEmail || donorEmail,
            amount: data.amount || amount,
            currency: data.currency || sendCurrency,
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
      window.location.href = `/${locale}/donate/donate-success?ref=${encodeURIComponent(
        data.reference
      )}`;
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
              <div>
                <label className="block mb-1 text-sm">Phone number</label>
                <input
                  className="w-full px-4 py-2 border rounded-2xl"
                  placeholder="2567XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Network</label>
                <div className="flex gap-3">
                  <button
                    className={`px-3 py-2 rounded-2xl border ${
                      network === "mtn"
                        ? "border-brand-blue ring-2 ring-brand-blue/20"
                        : ""
                    }`}
                    onClick={() => setNetwork("mtn")}
                  >
                    MTN
                  </button>
                  <button
                    className={`px-3 py-2 rounded-2xl border ${
                      network === "airtel"
                        ? "border-brand-blue ring-2 ring-brand-blue/20"
                        : ""
                    }`}
                    onClick={() => setNetwork("airtel")}
                  >
                    Airtel
                  </button>
                </div>
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
