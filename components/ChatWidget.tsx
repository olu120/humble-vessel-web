"use client";

import { useEffect, useRef } from "react";

export default function TawkLoader() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    const prop = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "";
    const wid  = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "";

    if (!prop || !wid) return; // quietly skip if not configured

    // Avoid double inject
    if (document.getElementById("tawk-script")) return;

    const s = document.createElement("script");
    s.id = "tawk-script";
    s.async = true;
    s.src = `https://embed.tawk.to/${prop}/${wid}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    document.body.appendChild(s);
    loaded.current = true;
  }, []);

  return null;
}
