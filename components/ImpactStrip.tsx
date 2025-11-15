// components/ImpactStrip.tsx
"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import React from "react";

function CountUp({
  to,
  duration = 1600,
}: { to: number; duration?: number }) {
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <>{val.toLocaleString()}</>;
}

type Stat = { label: string; value: number; approx?: boolean };

export default function ImpactStrip({ stats }: { stats: Stat[] }) {
  return (
    <section className="py-8 md:py-12 bg-white">
      <Container>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={i} className="rounded-2xl border bg-white px-4 py-5 shadow-sm">
              <div className="text-xl md:text-3xl font-semibold tracking-tight">
                <CountUp to={s.value} />
                {s.approx ? "+" : ""}
              </div>
              <div className="mt-1 text-xs md:text-sm opacity-70">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
  
}
