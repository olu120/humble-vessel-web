"use client";

import React from "react";

export default function Reveal({
  as: As = "div",
  children,
  className = "",
  threshold = 0.12,
  rootMargin = "0px 0px -10% 0px",
}: {
  as?: any;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    // Respect reduced motion: just show
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return (
    <As
      ref={ref as any}
      className={`reveal ${className}`}
      data-reveal-in={inView ? "true" : "false"}
    >
      {children}
    </As>
  );
}
