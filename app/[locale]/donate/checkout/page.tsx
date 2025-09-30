"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Section from "@/components/Section";
import Button from "@/components/Button";

// Small helper to turn ArrayBuffer -> base64 in the browser (no Node Buffer)
function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  // btoa expects binary string
  return typeof btoa !== "undefined" ? btoa(binary) : "";
}

function CheckoutInner() {
  const sp = useSearchParams();
  const pathname = usePathname() || "/en";
  const locale = (pathname.split("/")[1] || "en") as "en" | "lg";

  const tab = (sp.get("tab") as "local" | "intl") || "local";
  const amount = Number(sp.get("amount") || 0);

  // Local (Airtel Merchant) — email only
  const [donorEmailLocal, setDonorEmailLocal] = useState("");

  // Intl (SWIFT)
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // Privacy consent (both flows)
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);

  const proceed = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);

    // Basic consent gate (applies to both tabs)
    if (!consent) {
      alert(
        locale === "lg"
          ? "Bambi kaakasa nti okkiriza okutereka amawulire go okufuna risiti."
          : "Please agree to the privacy statement so we can store your details for receipts."
      );
      setLoading(false);
      return;
    }

    // ──────────────────────────
    // LOCAL (Airtel Merchant)
    // ──────────────────────────
    if (tab === "local") {
      // (Optional) validate email if provided
      if (donorEmailLocal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmailLocal)) {
        alert(
          locale === "lg"
            ? "Teeka email entuufu oba leka ekifo kino nga tekijjudde."
            : "Please enter a valid email or leave it blank."
        );
        setLoading(false);
        return;
      }

      // 1) Create intent on server (keeps existing server behavior)
      const res = await fetch("/api/payments/mobile-money/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "UGX",
          network: "airtel", // hard-coded to Airtel Merchant flow
          donorEmail: donorEmailLocal || undefined,
        }),
      });

      const data = await res.json();

      if (data?.reference) {
        try {
          // 2) Generate Airtel PDF on server
          const resPdf = await fetch("/api/payments/mobile-money/pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              merchantCode: "6890724",
              reference: data.reference,
              amount,
              currency: "UGX",
            }),
          });

          if (resPdf.ok) {
            const buf = await resPdf.arrayBuffer();
            const pdfBase64 = arrayBufferToBase64(buf);

            // 3) Email the PDF (if donor provided email)
            if (donorEmailLocal) {
              await fetch("/api/payments/mobile-money/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  donorEmail: donorEmailLocal,
                  reference: data.reference,
                  pdfBytesBase64: pdfBase64,
                }),
              });
            }

            // 4) Download a copy for the donor immediately
            const blob = new Blob([buf], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `HumbleVessel_Airtel_${data.reference}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
        } catch {
          // ignore and continue to success page
        }

        window.location.href = `/${locale}/donate/donate-success?method=mm&ref=${encodeURIComponent(
          data.reference
        )}`;
        return;
      }

      window.location.href = `/${locale}/donate/donate-cancel`;
      return;
    }

    // ──────────────────────────
    // INTERNATIONAL (SWIFT)
    // ──────────────────────────
    if (!donorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      alert(
        locale === "lg"
          ? "Bambi teeka email entuufu okufuna PDF/risiti yo."
          : "Please enter a valid email for your PDF/receipt."
      );
      setLoading(false);
      return;
    }

    const res = await fetch("/api/payments/swift/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "USD",
        donorName,
        donorEmail,
      }),
    });
    const data = await res.json();

    if (data?.instructions && data?.reference) {
      try {
        // Generate SWIFT PDF (server)
        const resPdf = await fetch("/api/payments/swift/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructions: data.instructions,
            reference: data.reference,
            donorName,
            donorEmail,
            amount,
            currency: "USD",
            feeUSD: data.feeUSD,
            receiveCurrency: "UGX",
          }),
        });

        if (resPdf.ok) {
          const buf = await resPdf.arrayBuffer();
          const pdfBase64 = arrayBufferToBase64(buf);

          // Email PDF to donor
          await fetch("/api/payments/swift/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              donorEmail,
              donorName,
              reference: data.reference,
              pdfBytesBase64: pdfBase64,
            }),
          });

          // Download a copy immediately
          const blob = new Blob([buf], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `HumbleVessel_SWIFT_${data.reference}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch {
        // ignore and continue to success page
      }

      window.location.href = `/${locale}/donate/donate-success?method=swift&ref=${encodeURIComponent(
        data.reference
      )}`;
    } else {
      window.location.href = `/${locale}/donate/donate-cancel`;
    }
  };

  return (
    <main>
      <Section
        title={
          locale === "lg"
            ? "Kakasa olw'okuwaayo ensasula"
            : "Confirm your donation"
        }
      >
        <div className="max-w-xl p-6 border rounded-2xl space-y-6">
          {/* Type & Amount */}
          <div>
            <p className="text-sm opacity-80">
              {locale === "lg" ? "Ekika ky'ensasula" : "Donation type"}
            </p>
            <p className="text-lg font-medium">
              {tab === "intl"
                ? locale === "lg"
                  ? "International (USD)"
                  : "International (USD)"
                : locale === "lg"
                ? "Wano mu Uganda (UGX)"
                : "Local (UGX)"}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-80">
              {locale === "lg" ? "Omuwendo" : "Amount"}
            </p>
            <p className="text-2xl font-semibold">
              {tab === "intl"
                ? `$${amount}`
                : `UGX ${amount.toLocaleString()}`}
            </p>
          </div>

          {/* LOCAL (Airtel merchant) */}
          {tab === "local" && (
            <div className="space-y-3">
              <div className="px-4 py-3 text-sm border rounded-xl bg-gray-50">
                <p className="font-medium">
                  Airtel Money (Merchant Code)
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {locale === "lg"
                    ? "Tujjakukuwerera PDF erimu entegeka zonna n’ensingo ya kisasu (reference)."
                    : "We’ll generate a PDF with step-by-step instructions and your payment reference."}
                </p>
                <p className="mt-2 text-sm">
                  <b>Merchant Code:</b> 6890724
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm">
                  {locale === "lg"
                    ? "Email (okufuna PDF ne risiti)"
                    : "Donor email (for PDF/receipt)"}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-2xl"
                  placeholder="you@example.com"
                  value={donorEmailLocal}
                  onChange={(e) => setDonorEmailLocal(e.target.value)}
                />
                <p className="mt-1 text-xs opacity-70">
                  {locale === "lg"
                    ? "Tujjakuweereza Airtel instructions PDF ne risiti yo."
                    : "We’ll email your Airtel instructions PDF and receipt."}
                </p>
              </div>
            </div>
          )}

          {/* INTERNATIONAL (SWIFT) */}
          {tab === "intl" && (
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm">
                  {locale === "lg"
                    ? "Erinnya ly'omuwaayo"
                    : "Donor name"}
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-2xl"
                  placeholder={locale === "lg" ? "Erinnya eryoona" : "Full name"}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">
                  {locale === "lg" ? "Email" : "Donor email"}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-2xl"
                  placeholder="you@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
              </div>

              <div className="px-4 py-3 text-sm border rounded-xl bg-yellow-50">
                <p className="mb-1">
                  <strong>
                    {locale === "lg" ? "Okulabula:" : "Important:"}
                  </strong>
                </p>
                <ul className="ml-5 space-y-1 list-disc">
                  <li>
                    {locale === "lg"
                      ? "Ensasula ezitwalibwa mu USD ziteekebwa mu UGX ku rate ya bbanka."
                      : "Transfers are sent in USD but the bank credits in UGX at their FX rate."}
                  </li>
                  <li>
                    {locale === "lg"
                      ? "Obuwumbi $50 busalibwa ku bbanka eyaniriza ensasula."
                      : "A flat $50 receiving bank fee is deducted."}
                  </li>
                  <li>
                    {locale === "lg"
                      ? "Teekamu Payment Reference nga bwe kiri mu PDF."
                      : "Include the Payment Reference exactly as shown in the PDF."}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Privacy / consent */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={() => setConsent((v) => !v)}
              className="mt-0.5"
            />
            <span>
              {locale === "lg"
                ? "Nkakasa nti nkiriza okutereka amawulire gange okuddiza risiti n'okukola lipooti y’ensasula."
                : "I agree that my details may be stored to issue receipts and reconcile donations."}
            </span>
          </label>

          <Button onClick={proceed} disabled={loading}>
            {loading
              ? locale === "lg"
                ? "Okutambuza…"
                : "Processing…"
              : locale === "lg"
              ? "Genda mumaaso"
              : "Proceed"}
          </Button>
        </div>
      </Section>
    </main>
  );
}

export default function DonateCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading checkout…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
