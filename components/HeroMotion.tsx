// components/HeroMotion.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  img: string; // local /public path recommended
  title: string;
  subtitle?: string;
  ctas?: Array<{ label: string; href: string; variant?: "primary" | "secondary" }>;
  focal?: { x: number; y: number }; // 0..1
};

export default function HeroMotion({
  slides,
  locale,
  intervalMs = 5500,
}: {
  slides: Slide[];
  locale: "en" | "lg";
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const total = slides.length;

  const go = (n: number) => setIdx((p) => (p + n + total) % total);
  const goTo = (n: number) => setIdx(((n % total) + total) % total);

  // autoplay (skips when reduced motion is on)
  useEffect(() => {
    if (prefersReduced || paused || total <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % total), intervalMs);
    return () => clearInterval(t);
  }, [prefersReduced, paused, total, intervalMs]);

  // keyboard (left/right)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const active = slides[idx];
  const focal = active.focal || { x: 0.5, y: 0.5 };
  const objectPosition = `${Math.round(focal.x * 100)}% ${Math.round(focal.y * 100)}%`;

  const dots = useMemo(() => new Array(total).fill(0).map((_, i) => i), [total]);

  return (
    <section
      className="relative h-[48vh] md:h-[64vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero slides"
    >
      {/* Slides (fade) */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 will-change-opacity"
          style={{ opacity: i === idx || prefersReduced ? 1 : 0, zIndex: i === idx ? 1 : 0 }}
          aria-hidden={i !== idx}
        >
          <Image
            src={s.img}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/55" />
        </div>
      ))}

      {/* Copy */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight md:leading-tight">
            {active.title}
          </h1>
          {active.subtitle && (
            <p className="mt-3 md:mt-4 text-base md:text-lg opacity-90">
              {active.subtitle}
            </p>
          )}
          {!!active.ctas?.length && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {active.ctas.map((c, i) =>
                c.variant === "secondary" ? (
                  <Link key={i} href={c.href}>
                    <Button variant="secondary">{c.label}</Button>
                  </Link>
                ) : (
                  <Link key={i} href={c.href}>
                    <Button>{c.label}</Button>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {total > 1 && (
        <>
          {/* Prev/Next */}
          <button
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/70 p-2 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            ‹
          </button>
          <button
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/70 p-2 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {dots.map((i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === idx ? "true" : undefined}
                onClick={() => goTo(i)}
                className={`h-[6px] rounded-full transition-all ${
                  i === idx ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(m.matches);
    on();
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return reduced;
}
