// components/IntroVideoModal.tsx
"use client";

import { useEffect, useRef } from "react";

interface IntroVideoModalProps {
  open: boolean;
  onClose: () => void;
  src: string; // e.g. "/videos/hv-intro.mp4"
}

export default function IntroVideoModal({ open, onClose, src }: IntroVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Close with Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Auto-play when opened
  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // ignore autoplay blocking
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
      {/* backdrop click closes */}
      <button
        type="button"
        aria-label="Close video"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black/70 px-3 py-1 text-sm text-white hover:bg-black"
          >
            ✕ Close
          </button>
        </div>
        <video
          ref={videoRef}
          className="w-full h-auto rounded-2xl bg-black shadow-2xl"
          controls
          playsInline
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}