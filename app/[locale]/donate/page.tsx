import type { Metadata } from "next";
import DonateClient from "./DonateClient";

const SITE = "https://humblevesselfoundationandclinic.org";
const OG = "/og-donate.jpg";

export const metadata: Metadata = {
  title: "Donate | Humble Vessel Foundation & Clinic",
  description: "Support healthcare and justice in Uganda. Every contribution makes a difference.",
  openGraph: {
    type: "website",
    url: `${SITE}/donate`,
    title: "Donate | Humble Vessel Foundation & Clinic",
    description: "Support healthcare and justice in Uganda. Every contribution makes a difference.",
    siteName: "Humble Vessel Foundation & Clinic",
    images: [{ url: OG, width: 1200, height: 630, alt: "Donate to Humble Vessel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate | Humble Vessel Foundation & Clinic",
    description: "Support healthcare and justice in Uganda.",
    images: [OG],
  },
};

export default function Page() {
  return <DonateClient />;
}
