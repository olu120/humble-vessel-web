"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

type Method = "mm" | "swift";

const dict = {
  en: {
    title: "Thank you for your donation",
    mmIntro: "Please complete your payment using Airtel Money.",
    mmSteps: [
      "Dial *185# on your Airtel line.",
      "Choose Pay Bill / Merchant.",
      "Enter Merchant Code: 6890724.",
      "Enter amount exactly as pledged.",
      "Enter Payment Reference as provided.",
      "Confirm and complete the payment on your phone.",
    ],
    downloadAirtel: "Download Airtel Instructions (PDF)",
    swiftIntro:
      "We’ve emailed your SWIFT instructions PDF. Please include the payment reference exactly as shown.",
    downloadSwift: "Download SWIFT Instructions (PDF)",
    help: "Need help? Contact us on WhatsApp:",
    noCtx: "We couldn’t find your donation details on this page.",
    goHome: "Go to Donate",
  },
  lg: {
    title: "Webale nnyo olw’okuwaayo ensasula yo",
    mmIntro: "Bambi maliriza ensasula nga okozesa Airtel Money.",
    mmSteps: [
      "Cakula *185# ku layini yo eya Airtel.",
      "Londa Pay Bill / Merchant.",
      "Teeka Merchant Code: 6890724.",
      "Teeka omuwendo ng’ogusuubiza.",
      "Teeka Payment Reference nga bwe baakuwadde.",
      "Kakasa olwo omulimu gumalirizibwe ku ssimu yo.",
    ],
    downloadAirtel: "Wanula Airtel PDF (Ebiteekateeka)",
    swiftIntro:
      "Tukuweerezze PDF ya SWIFT mu email. Bambi teekamu Payment Reference nga bwe kiri mu PDF.",
    downloadSwift: "Wanula SWIFT PDF",
    help: "Oyetaaga obuyambi? Tuukirira ku WhatsApp:",
    noCtx: "Tetusobodde kufuna ebikwata ku nsasula yo ku muko guno.",
    goHome: "Ddayo ku Donate",
  },
};

function Inner() {
  const sp = useSearchParams();
  const pathname = usePathname() || "/en";
  const locale = (pathname.split("/")[1] || "en") as "en" | "lg";
  const t = dict[locale];

  const [mmPayload, setMmPayload] = useState<any>(null);
  const [swiftPayload, setSwiftPayload] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  const urlMethod = (sp.get("method") as Method | null) || null;
  const refFromUrl = sp.get("ref") || "";

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

  const whatsapp = process.env.NEXT_PUBLIC_ORG_WHATSAPP || "+256 774 381 886";

  const langHref = (targetLocale: "en" | "lg") => {
    const parts = pathname.split("/").slice(2); // after locale
    const base = `/${targetLocale}/${parts.join("/")}`.replace(/\/+$/, "");
    const qs = new URLSearchParams();
    if (method) qs.set("method", method);
    if (reference) qs.set("ref", reference);
    const q = qs.toString();
    return q ? `${base}?${q}` : base;
  };

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
          reference,
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

  if (!isReady) {
    return <div className="max-w-2xl mx-auto p-6">Loading…</div>;
  }

  // Graceful fallback if method missing
  if (!method) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href={langHref("en")} className={locale === "en" ? "font-bold underline" : "underline"}>EN</Link>
          <span>·</span>
          <Link href={langHref("lg")} className={locale === "lg" ? "font-bold underline" : "underline"}>LG</Link>
        </div>

        <h1 className="text-2xl font-bold mb-3">{t.title}</h1>
        <div className="p-4 border rounded-xl bg-yellow-50">
          {t.noCtx}
          <div className="mt-3">
            <Link href={`/${locale}/donate`} className="underline">
              {t.goHome}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href={langHref("en")} className={locale === "en" ? "font-bold underline" : "underline"}>EN</Link>
        <span>·</span>
        <Link href={langHref("lg")} className={locale === "lg" ? "font-bold underline" : "underline"}>LG</Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>

      <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
        {method === "mm" ? (
          <>
            <p className="mb-1">{t.mmIntro}</p>
            <ul className="list-disc ml-6 space-y-1 text-sm">
              {t.mmSteps.map((s, i) => <li key={i}>{s}</li>)}
              <li>
                <b>Ref:</b> {reference || "—"} &nbsp;•&nbsp; <b>{currency}</b>{" "}
                {Number(amount || 0).toLocaleString()}
              </li>
            </ul>
            <div className="pt-2">
              <Button onClick={downloadAirtelPdf}>{t.downloadAirtel}</Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-2">{t.swiftIntro}</p>
            <p className="text-sm">
              <b>Ref:</b> {reference || "—"} &nbsp;•&nbsp; <b>{currency}</b>{" "}
              {Number(amount || 0).toLocaleString()}
            </p>
            <div className="pt-2">
              <Button onClick={downloadSwiftPdf}>{t.downloadSwift}</Button>
            </div>
          </>
        )}

        <div className="pt-4 text-xs opacity-70 border-t mt-4">
          {t.help}{" "}
          <a
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_ORG_WHATSAPP || "+256774381886").replace(/\D/g, "")}`}
            className="underline"
          >
            {process.env.NEXT_PUBLIC_ORG_WHATSAPP || "+256 774 381 886"}
          </a>
        </div>
      </div>
    </main>
  );
}

export default function SuccessClient() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
