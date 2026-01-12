"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Detect video type and convert to embeddable source
 */
function toEmbed(url: string): {
  type: "youtube" | "vimeo" | "mp4" | "unknown";
  src: string;
} {
  const u = (url || "").trim();
  if (!u) return { type: "unknown", src: "" };

  // MP4 (WordPress media uploads)
  if (u.toLowerCase().endsWith(".mp4")) {
    return { type: "mp4", src: u };
  }

  // YouTube
  const yt =
    u.match(/youtube\.com\/watch\?v=([^&]+)/i) ||
    u.match(/youtu\.be\/([^?&]+)/i) ||
    u.match(/youtube\.com\/embed\/([^?&]+)/i);

  if (yt?.[1]) {
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1`,
    };
  }

  // Vimeo
  const vm =
    u.match(/vimeo\.com\/(\d+)/i) ||
    u.match(/player\.vimeo\.com\/video\/(\d+)/i);

  if (vm?.[1]) {
    return {
      type: "vimeo",
      src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1`,
    };
  }

  return { type: "unknown", src: u };
}

type Props = {
  videoUrl?: string; // comes from WP ACF
  label?: string;
};

export default function IntroVideoModal({
  videoUrl = "",
  label = "▶ Watch Intro Video",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => setMounted(true), []);

  const embed = useMemo(() => toEmbed(videoUrl), [videoUrl]);

  // Lock scroll + ESC to close
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reload MP4 when opening
  useEffect(() => {
    if (open && embed.type === "mp4") {
      try {
        videoRef.current?.load();
      } catch {}
    }
  }, [open, embed.type]);

  // No video → no button
  if (!videoUrl) return null;

  const modal = open ? (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Intro video"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-4xl">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute z-20 px-3 py-1 text-sm text-white rounded-full right-2 top-2 bg-black/80 hover:bg-black"
          aria-label="Close video"
        >
          ✕
        </button>

        {/* Video container */}
        <div className="overflow-hidden bg-black shadow-2xl rounded-2xl">
          {embed.type === "mp4" ? (
            <div className="w-full bg-black aspect-video">
              <video
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                className="object-contain w-full h-full bg-black"
              >
                <source src={embed.src} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          ) : embed.type === "youtube" || embed.type === "vimeo" ? (
            <iframe
              className="w-full aspect-video"
              src={embed.src}
              title="Intro Video"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="p-6 text-sm text-white">
              Video link is set but not supported.
              <div className="mt-2 break-all opacity-80">{videoUrl}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-2 text-sm text-white transition rounded-full shadow-md bg-brand-blue hover:shadow-lg md:text-base"
      >
        {label}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
