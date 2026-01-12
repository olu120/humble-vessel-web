// components/Button.tsx
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium transition " +
    "text-sm px-4 py-2 md:text-base md:px-5 md:py-3 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 " +
    "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";

  const styles =
    {
      primary:
        "bg-brand-blue text-white hover:brightness-110 shadow-sm hover:shadow",
      secondary:
        "border border-brand-green text-brand-green hover:bg-brand-green hover:text-white",
      ghost: "text-brand-blue hover:underline bg-transparent",
    }[variant] || "";

  return (
    <button
      type={type}
      className={`${base} ${styles} ${className}`}
      {...props}
    />
  );
}
