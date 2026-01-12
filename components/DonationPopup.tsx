// components/DonationPopup.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

type DonationPopupProps = {
  locale: "en" | "lg";
};

const STORAGE_KEY = "hv_donate_popup_seen";

export default function DonationPopup({ locale }: DonationPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (seen === "1") return;

    const timer = window.setTimeout(() => setOpen(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  // Lock body scroll + ESC to close
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  if (!open) return null;

  const title =
    locale === "lg"
      ? "Weyunge ku kukyusa obulamu leero"
      : "Help a patient get care today";

  const body =
    locale === "lg"
      ? "Akabonero akatono kayinza okuyamba ku musaayi, eddagala, n’okwejjanjabwa mu bitundu bya Uganda."
      : "Even a small gift helps cover medicine, lab tests and clinic visits for families in Uganda.";

  const donateLabel = locale === "lg" ? "Waayo eky’obuyambi" : "Donate now";
  const laterLabel = locale === "lg" ? "Ssi kaakano" : "Maybe later";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Donation reminder"
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingTop: "max(1rem, env(safe-area-inset-top))",
      }}
      onMouseDown={(e) => {
        // Click outside panel closes
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-md p-5 bg-white shadow-2xl rounded-2xl ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-700">{body}</p>
          </div>

          <button
            type="button"
            onClick={close}
            className="inline-flex items-center justify-center rounded-full h-9 w-9 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-5 sm:flex-row sm:items-center sm:justify-start">
          <Link href={`/${locale}/donate`} className="w-full sm:w-auto">
            <Button type="button" className="w-full sm:w-auto">
              {donateLabel}
            </Button>
          </Link>

          <button
            type="button"
            onClick={close}
            className="text-sm rounded-md text-slate-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            {laterLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
