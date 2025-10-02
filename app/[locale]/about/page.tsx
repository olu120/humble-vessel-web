import Section from "@/components/Section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Humble Vessel Foundation & Clinic",
  description: "Who we are and how we serve the community.",
  openGraph: {
    title: "About — Humble Vessel Foundation & Clinic",
    description: "Who we are and how we serve the community.",
    images: [{ url: "/og-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function AboutPage() {
  return (
    <main>
      <Section title="About Us" subtitle="Mission • Story • Impact">
        <p>We’ll pull real content from WordPress and add a Uganda-focused map placeholder.</p>
      </Section>
    </main>
  );
}
