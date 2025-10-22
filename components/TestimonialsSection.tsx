// components/TestimonialsSection.tsx
"use client";

import React from "react";

type Testimonial = {
  id: string | number;
  name: string;
  rating: number; // 0..5
  comment: string;
};

export default function TestimonialsSection({
  title,
  items,
}: {
  title: string;
  items: Testimonial[];
}) {
  // Clamp ratings safely
  const clamp = (n: number) => Math.max(0, Math.min(5, Number(n) || 0));

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-2xl font-semibold">{title}</h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => {
            const rating = clamp(t.rating);
            return (
              <li
                key={t.id}
                className="rounded-2xl bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="mb-2 flex items-center gap-2">
                  <strong className="text-sm">{t.name}</strong>
                  <span className="text-xs opacity-60">• {rating}/5</span>
                </div>

                <Stars rating={rating} />

                <p className="mt-3 text-sm opacity-90">{t.comment}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const empty = 5 - full;

  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} filled />
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} filled={false} />
      ))}
    </div>
  );
}

function Star({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      className={filled ? "fill-yellow-400" : "fill-gray-300"}
      aria-hidden="true"
    >
      <path d="M10 1.5l2.7 5.46 6.03.88-4.37 4.26 1.03 6.01L10 15.9l-5.39 2.83 1.03-6.01-4.37-4.26 6.03-.88L10 1.5z" />
    </svg>
  );
}
