"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type RevealProps = {
  /** Which element/component to render as */
  as?: React.ElementType;
  /** Delay in ms before animating once intersected */
  delay?: number;
  /** Initial Y offset in px */
  y?: number;
  className?: string;
  children: React.ReactNode;
};

export default function Reveal({
  as = "div",
  delay = 0,
  y = 12,
  className,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const t = window.setTimeout(() => setShown(true), delay);
            io.unobserve(el);
            return () => window.clearTimeout(t);
          }
        }
      },
      { threshold: 0.12 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  // Build props and render without JSX to avoid the <Tag/> typing pitfall
  const Comp = as;
  const style = shown ? undefined : ({ transform: `translateY(${y}px)` } as React.CSSProperties);

  return React.createElement(
    Comp,
    {
      ref: ref as any,
      className: clsx(
        "transition-all duration-700 ease-out will-change-transform",
        shown ? "opacity-100 translate-y-0" : "opacity-0",
        className
      ),
      style,
    },
    children
  );
}
