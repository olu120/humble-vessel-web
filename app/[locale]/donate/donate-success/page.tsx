"use client";

export const dynamic = "force-dynamic"; // avoid prerender errors for search params

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Section from "@/components/Section";
import Button from "@/components/Button";

function SuccessInner() {
  const sp = useSearchParams(); // OK inside Suspense
  const ref = sp.get("ref") || "";
  const [downloading, setDownloading] = useState(false);
  const [hasPayload, setHasPayload] = useState(false);

  useEffect(() => {
    setHasPayload(!!sessionStorage.getItem("hv_last_swift_payload"));
  }, []);

  const reDownload = async () => {
    const raw = sessionStorage.getItem("hv_last_swift_payload");
    if (!raw) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/payments/swift/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw, // already JSON string
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const { reference } = JSON.parse(raw);
        a.href = url;
        a.download = `HumbleVessel_SWIFT_${reference}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main>
      <Section title="Thank you for your donation">
        <div className="max-w-xl p-6 space-y-4 border rounded-2xl">
          <p className="text-lg">
            We’ve emailed your SWIFT instructions PDF. Please include the payment reference
            exactly as shown.
          </p>
          {ref && (
            <p className="text-sm opacity-70">
              Reference: <b>{ref}</b>
            </p>
          )}

          {hasPayload && (
            <Button onClick={reDownload} disabled={downloading}>
              {downloading ? "Preparing PDF…" : "Download again"}
            </Button>
          )}

          <p className="text-sm opacity-70">
            Didn’t receive the email? Check your spam folder or contact us on WhatsApp.
          </p>
        </div>
      </Section>
    </main>
  );
}

export default function DonateSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
