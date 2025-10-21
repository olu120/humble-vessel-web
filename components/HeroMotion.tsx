"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";

type Slide = {
  img: string;                // /images/hero-1.jpg (recommended local) or full URL
  title: string;
  subtitle?: string;
  ctas?: { label: string; href: string; variant?: "primary" | "secondary" }[];
  focal?: { x: number; y: number }; // 0..1 to keep subject in frame on mobile
  alt?: string;
  unoptimized?: boolean;      // set true if using CMS URLs until remote image domain is fully configured
};

export default function HeroMotion({
  slides,
  locale = "en",
  intervalMs = 6000,
}: {
  slides: Slide[];
  locale?: "en" | "lg";
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);
  const paused = useRef(false);
  const reduce = useReducedMotion();

  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  useEffect(() => {
    if (!safeSlides.length) return;
    if (reduce) return; // respect prefers-reduced-motion
    const t = setInterval(() => {
      if (paused.current) return;
      setI((p) => (p + 1) % safeSlides.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [safeSlides.length, intervalMs, reduce]);

  if (!safeSlides.length) return null;
  const current = safeSlides[i];

  return (
    <section
      className="relative h-[46vh] md:h-[60vh] overflow-hidden"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: "easeOut" }}
        >
          <Image
            src={current.img}
            alt={current.alt || current.title}
            fill
            // If these are CMS images and you’re still whitelisting the domain,
            // temporarily set unoptimized to avoid build errors:
            unoptimized={current.unoptimized}
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
            style={{
              objectPosition: current.focal
                ? `${current.focal.x * 100}% ${current.focal.y * 100}%`
                : "center",
            }}
          />
          {/* gradient wash for copy legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/55" />
        </motion.div>
      </AnimatePresence>

      {/* Copy */}
      <div className="relative z-10 h-full grid place-items-center text-white px-4">
        <div className="max-w-3xl text-center">
          <motion.h1
            className="text-3xl md:text-5xl font-semibold"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.05 }}
          >
            {current.title}
          </motion.h1>

          {current.subtitle && (
            <motion.p
              className="mt-3 opacity-90"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.15 }}
            >
              {current.subtitle}
            </motion.p>
          )}

          {!!current.ctas?.length && (
            <motion.div
              className="flex items-center justify-center gap-3 mt-6"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.25 }}
            >
              {current.ctas.map((c) => (
                <a
                  key={c.href + c.label}
                  href={c.href}
                  className={
                    c.variant === "secondary"
                      ? "px-5 py-3 rounded-2xl border border-white/70 hover:bg-white/10 transition"
                      : "px-5 py-3 rounded-2xl bg-brand-blue text-white hover:brightness-110 transition"
                  }
                >
                  {c.label}
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress dots */}
      {safeSlides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          {safeSlides.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition ${
                idx === i ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
              }`}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
      )}

      {/* brand accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-yellow z-10" />
    </section>
  );
}
