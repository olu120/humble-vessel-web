// app/[locale]/layout.tsx
import type { Metadata } from "next";
import "../../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";
import DonationPopup from "@/components/DonationPopup";

const SITE = "https://humblevesselfoundationandclinic.org";
const SUPPORTED = new Set(["en", "lg"]);

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = SUPPORTED.has(raw) ? (raw as "en" | "lg") : "en";

  const t =
    locale === "lg"
      ? {
          title: "Humble Vessel Foundation & Clinic",
          desc: "Obuweereza obw’obulamu obwesigika — okufaayo ku bantu n’obwenkanya.",
          ogLocale: "lg_UG",
        }
      : {
          title: "Humble Vessel Foundation & Clinic",
          desc: "Trustworthy, community-centered healthcare in Uganda.",
          ogLocale: "en_US",
        };

  const canonical = `${SITE}/${locale}`;

  return {
    title: t.title,
    description: t.desc,
    metadataBase: new URL(SITE),
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE}/en`,
        lg: `${SITE}/lg`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Humble Vessel Foundation & Clinic",
      title: t.title,
      description: t.desc,
      images: [{ url: "/og-cover.jpg", width: 1200, height: 630, alt: t.title }],
      locale: t.ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.desc,
      images: ["/og-cover.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: raw } = await params;
  const locale = SUPPORTED.has(raw) ? (raw as "en" | "lg") : "en";

  return (
    <html lang={locale}>
      <head>
        {/* Perf: Preconnect to CMS origin */}
        <link rel="preconnect" href="https://cms.humblevesselfoundationandclinic.org" crossOrigin="" />
      </head>
      <body className="antialiased">
        <Header locale={locale} />
        {children}
        {/* FIX: Pass locale here */}
        <DonationPopup locale={locale} />
        <Footer />
 {/* WhatsApp floating button (offset above Tawk bubble); move to left if you prefer */}
        <WhatsAppButton position="right" bottomOffset={104} locale={locale} />
        <ChatWidget />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "lg" }];
}
