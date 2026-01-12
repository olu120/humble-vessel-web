// components/ChatWidget.tsx
"use client";

import { useEffect, useRef } from "react";

export default function TawkLoader() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    const prop = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "";
    const wid = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "";
    if (!prop || !wid) return;

    if (document.getElementById("tawk-script")) return;

    // Must be available BEFORE the widget script is downloaded
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_API.customStyle = { zIndex: 70 };

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
