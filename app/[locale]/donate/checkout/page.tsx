"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Section from "@/components/Section";
import Button from "@/components/Button";

type Cadence = "one_time" | "weekly" | "biweekly" | "monthly";
type Tab = "local" | "intl";

// ArrayBuffer -> base64 (browser)
function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return typeof btoa !== "undefined" ? btoa(binary) : "";
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractErrorMessage(data: any): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (data.error) return String(data.error);
  if (data.message) return String(data.message);
  return null;
}

function CheckoutInner() {
  const sp = useSearchParams();
  const pathname = usePathname() || "/en";
  const locale = (pathname.split("/")[1] || "en") as "en" | "lg";

  const tab = (sp.get("tab") as Tab) || "local";
  const amountRaw = sp.get("amount");
  const amount = amountRaw ? Number(amountRaw) : 0;

  const cadence =
    (sp.get("cadence") as Cadence) ||
    "one_time";

  // Local
  const [donorEmailLocal, setDonorEmailLocal] = useState("");

  // Swift
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // Consent
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);

  const proceed = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      alert(locale === "lg"
        ? "Omuwendo gw'ensimbi tegusoboka. Ddayo olonde omuwendo."
        : "Invalid amount. Please go back and choose an amount."
      );
      setLoading(false);
      return;
    }

    if (!consent) {
      alert(locale === "lg"
        ? "Bambi kaakasa nti okkiriza okutereka amawulire go okufuna risiti."
        : "Please agree to the privacy statement so we can store your details for receipts."
      );
      setLoading(false);
      return;
    }

    // ───────── LOCAL ─────────
    if (tab === "local") {
      if (donorEmailLocal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmailLocal)) {
        alert(locale === "lg"
          ? "Teeka email entuufu oba leka ekifo kino nga tekijjudde."
          : "Please enter a valid email or leave it blank."
        );
        setLoading(false);
        return;
      }

      // ✅ initiate (server will email PDF if email provided — we’ll add that next)
      const res = await fetch("/api/payments/mobile-money/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "UGX",
          network: "airtel",
          donorEmail: donorEmailLocal || undefined,
          cadence,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        alert(
          extractErrorMessage(data) ||
          (locale === "lg" ? "Wabaddewo ekizibu. Gezaako nate." : "Something went wrong. Please try again.")
        );
        setLoading(false);
        return;
      }

      if (!data?.reference) {
        alert(locale === "lg"
          ? "Server tewaddemu reference. Gezaako nate."
          : "Server did not return a reference. Please try again."
        );
        setLoading(false);
        return;
      }

      // Optional: still download PDF for donor immediately
      try {
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

          const blob = new Blob([buf], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `HumbleVessel_Airtel_${data.reference}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch {
        // ignore
      }

      window.location.href =
        `/${locale}/donate/donate-success?method=mm&ref=${encodeURIComponent(data.reference)}` +
        `&amount=${encodeURIComponent(String(amount))}&currency=UGX`;

      return;
    }

    // ───────── SWIFT ─────────
    if (!donorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      alert(locale === "lg"
        ? "Bambi teeka email entuufu okufuna PDF/risiti yo."
        : "Please enter a valid email for your PDF/receipt."
      );
      setLoading(false);
      return;
    }

    // ✅ initiate (SWIFT already emails on server)
    const res = await fetch("/api/payments/swift/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "USD",
        donorName,
        donorEmail,
        cadence,
      }),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      alert(
        extractErrorMessage(data) ||
        (locale === "lg" ? "Wabaddewo ekizibu. Gezaako nate." : "Something went wrong. Please try again.")
      );
      setLoading(false);
      return;
    }

    if (!data?.reference || !data?.instructions) {
      alert(locale === "lg"
        ? "Server tewaddemu reference/instructions. Gezaako nate."
        : "Server did not return reference/instructions. Please try again."
      );
      setLoading(false);
      return;
    }

    // Optional: download PDF immediately (but NO email here)
    try {
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
        const blob = new Blob([buf], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `HumbleVessel_SWIFT_${data.reference}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // ignore
    }

    window.location.href =
      `/${locale}/donate/donate-success?method=swift&ref=${encodeURIComponent(data.reference)}` +
      `&amount=${encodeURIComponent(String(amount))}&currency=USD`;

    return;
  };

  return (
    <main>
      <Section title={locale === "lg" ? "Kakasa olw'okuwaayo ensasula" : "Confirm your donation"}>
        <div className="max-w-xl p-6 space-y-6 border rounded-2xl">

          {/* Amount */}
          <div>
            <p className="text-sm opacity-80">{locale === "lg" ? "Omuwendo" : "Amount"}</p>
            <p className="text-2xl font-semibold">
              {tab === "intl" ? `$${amount}` : `UGX ${amount.toLocaleString()}`}
            </p>
          </div>

          {/* LOCAL */}
          {tab === "local" && (
            <div className="space-y-3">
              <div className="px-4 py-3 text-sm border rounded-xl bg-gray-50">
                <p className="font-medium">Airtel Money (Merchant Code)</p>
                <p className="mt-2 text-sm">
                  <b>Merchant Code:</b> 6890724
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm">
                  {locale === "lg" ? "Email (okufuna PDF ne risiti)" : "Donor email (for PDF/receipt)"}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-2xl"
                  placeholder="you@example.com"
                  value={donorEmailLocal}
                  onChange={(e) => setDonorEmailLocal(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* INTERNATIONAL */}
          {tab === "intl" && (
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm">{locale === "lg" ? "Erinnya" : "Donor name"}</label>
                <input
                  className="w-full px-4 py-2 border rounded-2xl"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">{locale === "lg" ? "Email" : "Donor email"}</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-2xl"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Consent */}
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
            {loading ? (locale === "lg" ? "Okutambuza…" : "Processing…") : (locale === "lg" ? "Genda mumaaso" : "Proceed")}
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
