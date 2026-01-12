// components/Header.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Container from "./Container";
import LanguageToggle from "./LanguageToggle";

export default function Header({ locale }: { locale: "en" | "lg" }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const t = useMemo(
    () => ({
      home: locale === "lg" ? "Awaka" : "Home",
      about: locale === "lg" ? "Ebikukwatako" : "About",
      donate: locale === "lg" ? "Waayo Eky’obuyambi" : "Donate",
      volunteer: locale === "lg" ? "Weyanjule" : "Volunteer",
      contact: locale === "lg" ? "Tuukirako" : "Contact",
      gallery: locale === "lg" ? "Ebifaananyi" : "Gallery",
    }),
    [locale]
  );

  const links = useMemo(
    () => [
      { href: `/${locale}`, label: t.home },
      { href: `/${locale}/about`, label: t.about },
      { href: `/${locale}/gallery`, label: t.gallery },
      { href: `/${locale}/volunteer`, label: t.volunteer },
      { href: `/${locale}/contact`, label: t.contact },
    ],
    [locale, t]
  );

  // Active route helper (simple but effective)
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  const navLinkBase =
    "rounded-xl px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40";

  const navLink = (href: string) =>
    `${navLinkBase} ${
      isActive(href)
        ? "text-brand-blue"
        : "text-slate-800 hover:text-brand-blue"
    }`;

  // Close on outside click (drawer)
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

  // Close on Escape + lock body scroll
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <Container className="flex items-center justify-between h-16 gap-3">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 shrink-0"
          aria-label="Humble Vessel Foundation & Clinic"
        >
          {/* Desktop logo */}
          <Image
            src="/images/logo.png"
            alt="Humble Vessel"
            width={170}
            height={36}
            className="hidden md:block"
            priority
          />
          {/* Mobile logo (smaller) */}
          <Image
            src="/images/logo.png"
            alt="Humble Vessel"
            width={130}
            height={28}
            className="block md:hidden"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="items-center hidden gap-2 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={navLink(l.href)}>
              {l.label}
            </Link>
          ))}

          <Link
            href={`/${locale}/donate`}
            className="px-4 py-2 ml-2 text-sm font-semibold text-white transition shadow-sm rounded-2xl bg-brand-blue hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
          >
            {t.donate}
          </Link>

          <div className="ml-2">
            <LanguageToggle />
          </div>
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center px-3 py-2 text-sm transition border shadow-sm rounded-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
        </div>
      </Container>

      {/* Mobile Drawer + Overlay */}
      {open && (
        <div className="md:hidden">
          {/* overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* drawer */}
          <div
            id="mobile-nav"
            ref={panelRef}
            className="fixed right-0 top-0 z-50 h-dvh w-[86vw] max-w-sm bg-white shadow-2xl border-l"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="Humble Vessel"
                  width={120}
                  height={26}
                />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm border rounded-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>

            <div className="px-3 py-3">
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive(l.href)
                        ? "bg-brand-light/60 text-brand-blue"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}

                <Link
                  href={`/${locale}/donate`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-3 mt-2 text-sm font-semibold text-white transition shadow-sm rounded-2xl bg-brand-blue hover:shadow-md hover:brightness-110"
                >
                  {t.donate}
                </Link>

                <div className="p-3 mt-3 text-xs rounded-2xl bg-slate-50 text-slate-700">
                  <p className="font-semibold">Tip</p>
                  <p className="mt-1 opacity-80">
                    Tap outside the menu or press <span className="font-medium">Esc</span> to close.
                  </p>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
