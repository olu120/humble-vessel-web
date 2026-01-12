// components/LanguageToggle.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

export default function LanguageToggle() {
  const pathname = usePathname() || "/en";
  const parts = pathname.split("/");
  const current = parts[1] === "lg" ? "lg" : "en";

  const buildHref = (lang: "en" | "lg") =>
    "/" + [lang, ...parts.slice(2)].join("/");

  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 " +
    "text-xs sm:text-sm font-medium transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href={buildHref("en")}
        className={clsx(
          base,
          current === "en"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100"
        )}
        aria-current={current === "en" ? "true" : undefined}
      >
        EN
      </Link>

      <span className="hidden sm:inline opacity-40">/</span>

      <Link
        href={buildHref("lg")}
        className={clsx(
          base,
          current === "lg"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100"
        )}
        aria-current={current === "lg" ? "true" : undefined}
      >
        LG
      </Link>
    </div>
  );
}
