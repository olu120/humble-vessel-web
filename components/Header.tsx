// components/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import LanguageToggle from "./LanguageToggle";

export default function Header({ locale }: { locale: "en" | "lg" }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    gallery: locale === "lg" ? "Ebifaananyi" : "Gallery",
  };

  const navLink =
    "text-sm font-medium text-slate-800 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 rounded-md px-1";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="sr-only">Humble Vessel Foundation &amp; Clinic</span>
          <Image
            src="/images/logo.png"
            alt="Humble Vessel"
            width={170}
            height={36}
            className="hidden md:block"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href={`/${locale}`} className={navLink}>
            {t.home}
          </Link>
          <Link href={`/${locale}/about`} className={navLink}>
            {t.about}
          </Link>
          <Link href={`/${locale}/gallery`} className={navLink}>
            {t.gallery}
          </Link>
          <Link href={`/${locale}/volunteer`} className={navLink}>
            {t.volunteer}
          </Link>
          <Link href={`/${locale}/contact`} className={navLink}>
            {t.contact}
          </Link>

          <Link
            href={`/${locale}/donate`}
            className="rounded-2xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
          >
            {t.donate}
          </Link>

          <LanguageToggle />
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border px-2 py-1 text-sm shadow-sm transition hover:bg-slate-50"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {open && (
        <div ref={panelRef} className="border-t bg-white md:hidden">
          <Container size="wide" className="py-3">
            <nav className="flex flex-col gap-3 text-sm">
              <Link
                href={`/${locale}`}
                onClick={() => setOpen(false)}
                className={navLink}
              >
                {t.home}
              </Link>
              <Link
                href={`/${locale}/about`}
                onClick={() => setOpen(false)}
                className={navLink}
              >
                {t.about}
              </Link>
              <Link
                href={`/${locale}/gallery`}
                onClick={() => setOpen(false)}
                className={navLink}
              >
                {t.gallery}
              </Link>
              <Link
                href={`/${locale}/volunteer`}
                onClick={() => setOpen(false)}
                className={navLink}
              >
                {t.volunteer}
              </Link>
              <Link
                href={`/${locale}/contact`}
                onClick={() => setOpen(false)}
                className={navLink}
              >
                {t.contact}
              </Link>
              <Link
                href={`/${locale}/donate`}
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center rounded-2xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110"
              >
                {t.donate}
              </Link>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
