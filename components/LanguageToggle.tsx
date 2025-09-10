"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LanguageToggle() {
  const pathname = usePathname() || "/en";
  const parts = pathname.split("/");
  const current = parts[1] === "lg" ? "lg" : "en";
  const other = current === "en" ? "lg" : "en";
  const replaced = "/" + [other, ...parts.slice(2)].join("/");

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link href={pathname.replace(`/${current}`, "/en")} className={`px-2 py-1 rounded ${current==="en" ? "bg-brand-blue text-white" : "hover:underline"}`}>EN</Link>
      <span className="opacity-40">/</span>
      <Link href={pathname.replace(`/${current}`, "/lg")} className={`px-2 py-1 rounded ${current==="lg" ? "bg-brand-blue text-white" : "hover:underline"}`}>LG</Link>
    </div>
  );
}
