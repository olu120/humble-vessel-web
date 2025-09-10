import "../../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React from "react";

const SUPPORTED = new Set(["en", "lg"]);

// Define our own prop type (no LayoutProps from "next")
type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // Next.js 15 passes params as a Promise
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: raw } = await params;
  const locale = SUPPORTED.has(raw) ? (raw as "en" | "lg") : "en";

  return (
    <html lang={locale}>
      <body className="antialiased">
        <Header locale={locale} />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// Prebuild locales
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "lg" }];
}
