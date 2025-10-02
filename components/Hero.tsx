// components/Hero.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero({ locale }: { locale: "en" | "lg" }) {
  const t = locale === "lg"
    ? {
        title: "Affordable, Accessible Healthcare",
        blurb:
          "Serving Bukasa, Wakiso District — powered by community support and transparency.",
        donate: "Donate Now",
        volunteer: "Volunteer",
      }
    : {
        title: "Affordable, Accessible Healthcare",
        blurb:
          "Serving Bukasa, Wakiso District — powered by community support and transparency.",
        donate: "Donate Now",
        volunteer: "Volunteer",
      };

  return (
    <section className="relative min-h-[56vh] rounded-b-[14px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.png" // change to .png if that’s your file
          alt="Humble Vessel — community healthcare"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {/* Soft overlay for contrast */}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-start gap-4">
        <h1 className="text-white text-3xl md:text-5xl font-semibold leading-tight drop-shadow">
          {t.title}
        </h1>
        <p className="text-white/90 max-w-2xl md:text-lg drop-shadow">
          {t.blurb}
        </p>

        <div className="mt-4 flex gap-3">
          <Link
            href={`/${locale}/donate`}
            className="inline-flex items-center rounded-xl bg-brand-blue text-white px-4 py-2 shadow hover:brightness-110 transition"
          >
            {t.donate}
          </Link>
          <Link
            href={`/${locale}/volunteer`}
            className="inline-flex items-center rounded-xl border border-white/70 text-white px-4 py-2 hover:bg-white/10 transition"
          >
            {t.volunteer}
          </Link>
        </div>
      </div>
    </section>
  );
}
