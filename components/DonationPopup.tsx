// components/DonationPopup.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

type DonationPopupProps = {
  locale?: "en" | "lg";
};

const STORAGE_KEY = "hv_donate_popup_seen";

export default function DonationPopup({ locale }: DonationPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Don’t show if already dismissed
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (seen === "1") return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 12000); // 12 seconds

    return () => clearTimeout(timer);
  }, []);

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
    <div className="fixed inset-0 z-40 flex items-end justify-center px-4 pb-6 sm:items-center sm:px-0">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/40"
        onClick={close}
        aria-label="Close donation reminder"
      />

      {/* Panel */}
      <div className="relative z-50 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-700">{body}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* IMPORTANT: Button wrapped in Link instead of using href on Button */}
          <Link href={`/${locale}/donate`} className="inline-block">
            <Button type="button">
              {donateLabel}
            </Button>
          </Link>

          <button
            type="button"
            onClick={close}
            className="text-sm text-slate-500 underline-offset-2 hover:underline"
          >
            {laterLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
