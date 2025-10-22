// components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import LanguageToggle from "./LanguageToggle";
import { useEffect, useRef, useState } from "react";

export default function Header({ locale }: { locale: "en" | "lg" }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const t = {
    home: locale === "lg" ? "Awaka" : "Home",
    about: locale === "lg" ? "Ebikukwatako" : "About",
    donate: locale === "lg" ? "Waayo Eky’obuyambi" : "Donate",
    volunteer: locale === "lg" ? "Weyanjule" : "Volunteer",
    contact: locale === "lg" ? "Tuukirako" : "Contact",
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <Container className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Humble Vessel" width={170} height={36} className="hidden md:block" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}`} className="hover:underline">{t.home}</Link>
          <Link href={`/${locale}/about`} className="hover:underline">{t.about}</Link>
          <Link href={`/${locale}/volunteer`} className="hover:underline">{t.volunteer}</Link>
          <Link href={`/${locale}/contact`} className="hover:underline">{t.contact}</Link>
          <Link href={`/${locale}/donate`} className="rounded-2xl bg-brand-blue px-4 py-2 text-white hover:opacity-90">{t.donate}</Link>
          <LanguageToggle />
        </nav>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageToggle />
          <button
            className="p-2 border rounded-lg"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
          >
            ☰
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {open && (
        <div ref={panelRef} className="md:hidden border-t bg-white">
          <Container className="flex flex-col py-3 space-y-2">
            <Link href={`/${locale}`} onClick={() => setOpen(false)}>{t.home}</Link>
            <Link href={`/${locale}/about`} onClick={() => setOpen(false)}>{t.about}</Link>
            <Link href={`/${locale}/volunteer`} onClick={() => setOpen(false)}>{t.volunteer}</Link>
            <Link href={`/${locale}/contact`} onClick={() => setOpen(false)}>{t.contact}</Link>
            <Link href={`/${locale}/donate`} onClick={() => setOpen(false)} className="rounded-xl bg-brand-blue px-4 py-2 text-white">{t.donate}</Link>
          </Container>
        </div>
      )}
    </header>
  );
}
