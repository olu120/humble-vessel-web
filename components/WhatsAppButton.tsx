"use client";

import React from "react";

type Props = {
  position?: "right" | "left";
  bottomOffset?: number;  // px from bottom; default keeps clear of Tawk bubble
  locale?: "en" | "lg";
};

export default function WhatsAppButton({
  position = "right",
  bottomOffset = 104, // ~26 * 4px => sits above Tawk’s default bubble
  locale = "en",
}: Props) {
  const num = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "");
  if (!num) return null;

  const text =
    locale === "lg"
      ? "Gyebale ko! Njagala okwogera n’omu ku mmwe ku nsonga z'ekibiina."
      : "Hello! I’d like to chat with the Humble Vessel team.";

  const href = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;

  const side =
    position === "left"
      ? "left-4 md:left-6"
      : "right-4 md:right-6";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{ bottom: bottomOffset }}
      className={`fixed z-[60] ${side} inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-lg px-4 py-3 hover:brightness-110 transition`}
    >
      {/* simple WA glyph */}
      <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
        <path d="M19.11 17.51c-.31-.18-1.82-1.06-2.1-1.18-.28-.1-.47-.18-.66.19-.19.36-.76 1.18-.94 1.43-.17.25-.35.27-.65.09-.31-.18-1.31-.48-2.5-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31 0-.48.17-.66.18-.18.31-.31.47-.5.16-.19.2-.31.3-.52.1-.2.05-.38-.02-.54-.08-.18-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.54.08-.83.38-.28.3-1.09 1.07-1.09 2.6 0 1.53 1.12 3.01 1.28 3.21.16.2 2.2 3.35 5.33 4.71.75.32 1.33.51 1.78.65.75.24 1.44.2 1.98.12.6-.09 1.82-.74 2.08-1.45.25-.7.25-1.31.18-1.45-.06-.14-.27-.22-.58-.4zM16.01 2.67c-7.31 0-13.24 5.93-13.24 13.24 0 2.34.61 4.53 1.68 6.45L2 30l7.86-2.06c1.86 1.02 3.99 1.6 6.15 1.6 7.31 0 13.24-5.93 13.24-13.24S23.32 2.67 16.01 2.67zm0 24.03c-2.03 0-4.03-.56-5.79-1.63l-.42-.25-4.67 1.23 1.25-4.55-.27-.46a11.35 11.35 0 0 1-1.7-5.93c0-6.27 5.1-11.37 11.37-11.37s11.37 5.1 11.37 11.37-5.1 11.37-11.37 11.37z"/>
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
