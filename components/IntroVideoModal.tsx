"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src?: string;
  label?: string;
};

export default function IntroVideoModal({
  src = "/videos/test.mp4", // temporarily keep test.mp4 here
  label = "▶ Watch Intro Video",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [err, setErr] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    setErr("");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // When modal opens, force a reload attempt and log metadata
  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (!v) return;

    // Force reload
    try {
      v.load();
    } catch {}

    const onLoaded = () => {
      console.log("VIDEO loadedmetadata duration:", v.duration);
      if (!v.duration || Number.isNaN(v.duration)) {
        setErr("Video loaded but duration is invalid. This is usually a server/header issue.");
      }
    };

    const onError = () => {
      const mediaErr = v.error;
      console.log("VIDEO error object:", mediaErr);
      setErr(
        `Video failed to load/play. Browser error code: ${mediaErr?.code ?? "unknown"}.`
      );
    };

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("error", onError);

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("error", onError);
    };
  }, [open]);

  const Modal = open ? (
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
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute z-20 px-3 py-1 text-sm text-white rounded-full right-2 top-2 bg-black/80 hover:bg-black"
          aria-label="Close video"
        >
          ✕
        </button>

        <div className="overflow-hidden bg-black shadow-2xl rounded-2xl">
  <iframe
    className="w-full aspect-video"
    src="https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=1&mute=1"
    title="Intro Video"
    allow="autoplay; encrypted-media; picture-in-picture"
    allowFullScreen
  />
</div>

        <div className="mt-2 space-y-2 text-xs text-center text-white/80">
          <p>Press <b>Esc</b> to close.</p>

          {/* This link is critical for diagnosing server issues */}
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Open video in a new tab
          </a>

          {err && (
            <p className="text-red-200">
              {err}
            </p>
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
        className="px-5 py-2 text-sm text-white transition rounded-full shadow-md bg-brand-blue md:text-base hover:shadow-lg"
      >
        {label}
      </button>

      {mounted && Modal ? createPortal(Modal, document.body) : null}
    </>
  );
}
