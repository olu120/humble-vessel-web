import React from "react";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** normal | wide | full */
  size?: "normal" | "wide" | "full";
};

export default function Container({ children, className = "", size = "normal" }: Props) {
  const max = {
    normal: "max-w-6xl",     // ~1152px
    wide: "max-w-7xl",       // ~1280px
    full: "max-w-[1400px]",  // only if you really want to go bigger
  }[size];

  return (
    <div className={clsx("mx-auto px-4 sm:px-6 lg:px-8", max, className)}>
      {children}
    </div>
  );
}
