"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";

export const dynamic = "force-dynamic";

type Method = "mm" | "swift";

export default function DonateSuccessPage() {
  const sp = useSearchParams();
  const [mmPayload, setMmPayload] = useState<any>(null);
  const [swiftPayload, setSwiftPayload] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  const urlMethod = (sp.get("method") as Method | null) || null;
  const refFromUrl = sp.get("ref") || "";

  // Load payloads once on mount
  useEffect(() => {
    try {
      const mm = sessionStorage.getItem("hv_last_local_payload");
      const sw = sessionStorage.getItem("hv_last_swift_payload");
      if (mm) setMmPayload(JSON.parse(mm));
      if (sw) setSwiftPayload(JSON.parse(sw));
    } catch {}
    setIsReady(true);
  }, []);

  const method: Method | null = useMemo(() => {
    if (urlMethod) return urlMethod;
    if (mmPayload?.method === "mobile_money") return "mm";
    if (swiftPayload?.method === "swift") return "swift";
    return null;
  }, [urlMethod, mmPayload, swiftPayload]);

  const reference =
    refFromUrl || mmPayload?.reference || swiftPayload?.reference || "";

  const amount =
    (method === "mm" ? mmPayload?.amount : swiftPayload?.amount) ?? 0;

  const currency =
    (method === "mm" ? mmPayload?.currency : swiftPayload?.currency) ||
    (method === "mm" ? "UGX" : "USD");

  const whatsapp =
    process.env.NEXT_PUBLIC_ORG_WHATSAPP || "+256 774 381 886";

  const downloadAirtelPdf = async () => {
    try {
      const res = await fetch("/api/payments/mobile-money/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantCode: "6890724",
          amount,
          currency,
          reference,
        }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HumbleVessel_Airtel_${reference || "instructions"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const downloadSwiftPdf = async () => {
    try {
      const payload = swiftPayload || {};
      const res = await fetch("/api/payments/swift/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: payload.instructions,
          reference: reference,
          donorName: payload.donorName,
          donorEmail: payload.donorEmail,
          amount: payload.amount ?? amount,
          currency: payload.currency ?? "USD",
          feeUSD: payload.feeUSD,
          receiveCurrency: payload.receiveCurrency ?? "UGX",
        }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HumbleVessel_SWIFT_${reference || "instructions"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  if (!isReady || !method) {
    return <div className="max-w-2xl p-6 mx-auto">Loading…</div>;
  }

  return (
    <main className="max-w-2xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Thank you for your donation</h1>

      <div className="p-4 space-y-3 border rounded-xl bg-gray-50">
        {method === "mm" ? (
          <>
            <p className="mb-1">
              Please complete your payment using <b>Airtel Money</b>.
            </p>
            <ul className="ml-6 space-y-1 text-sm list-disc">
              <li>Dial <b>*185#</b> on your Airtel line.</li>
              <li>Choose <b>Pay Bill / Merchant</b>.</li>
              <li>Enter Merchant Code: <b>6890724</b>.</li>
              <li>
                Enter Amount: <b>{currency} {Number(amount || 0).toLocaleString()}</b>.
              </li>
              <li>
                Enter Payment Reference: <b>{reference || "—"}</b>.
              </li>
              <li>Confirm and complete the payment on your phone.</li>
            </ul>

            <div className="pt-2">
              <Button onClick={downloadAirtelPdf}>
                Download Airtel Instructions (PDF)
              </Button>
            </div>

            <p className="text-xs opacity-70">
              Tip: Please keep your transaction SMS/receipt for your records.
            </p>
          </>
        ) : (
          <>
            <p className="mb-2">
              We’ve emailed your SWIFT instructions PDF. Please include the payment
              reference exactly as shown.
            </p>
            <p className="text-sm">Reference: <b>{reference}</b></p>

            <div className="pt-2">
              <Button onClick={downloadSwiftPdf}>
                Download SWIFT Instructions (PDF)
              </Button>
            </div>

            <p className="mt-2 text-xs opacity-70">
              Didn’t receive the email? Check your spam folder or contact us on WhatsApp.
            </p>
          </>
        )}

        <div className="pt-4 mt-4 text-xs border-t opacity-70">
          Need help? Contact us on WhatsApp:{" "}
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} className="underline">
            {whatsapp}
          </a>
        </div>
      </div>
    </main>
  );
}
