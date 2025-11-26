// components/IntroVideoModal.tsx
"use client";

import { useState } from "react";

export default function IntroVideoModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button – you can style this more later */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-2 rounded-full bg-brand-blue text-white text-sm md:text-base shadow-md hover:shadow-lg transition"
      >
        ▶ Watch Intro Video
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 rounded-full bg-black/60 text-white px-2 py-1 text-sm"
            >
              ✕
            </button>

            {/* Replace /videos/intro.mp4 once you upload the video to /public/videos */}
            <video
              controls
              autoPlay
              className="w-full rounded-2xl shadow-xl bg-black"
            >
              <source src="/videos/intro.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
