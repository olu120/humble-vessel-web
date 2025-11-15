"use client";

import React from "react";

export default function CountUp({
  to,
  duration = 1600,
  prefix = "",
  suffix = "",
  className = "",
}: {
  to: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    // Respect reduced motion: jump straight to value
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <span className={className}>{prefix}{val.toLocaleString()}{suffix}</span>;
}
