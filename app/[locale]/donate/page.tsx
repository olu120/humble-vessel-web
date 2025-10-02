// NO "use client" here
import type { Metadata } from "next";
import DonateClient from "./DonateClient";

const SITE = "https://humblevesselfoundationandclinic.org";
const OG = "/og-donate.jpg"; // make sure this exists under /public

export async function generateMetadata(
  { params }: { params: { locale: "en" | "lg" } }
): Promise<Metadata> {
  const { locale } = params;

  const t =
    locale === "lg"
      ? {
          title: "Weereza obuyambi | Humble Vessel Foundation & Clinic",
          desc:
            "Weyambise okuwa obuyambi mu by’obulamu n’obwenkanya mu Uganda. Buli kimu kiteeka akamu.",
        }
      : {
          title: "Donate | Humble Vessel Foundation & Clinic",
          desc:
            "Support healthcare and justice in Uganda. Every contribution makes a difference.",
        };

  return {
    title: t.title,
    description: t.desc,
    openGraph: {
      type: "website",
      url: `${SITE}/${locale}/donate`,
      siteName: "Humble Vessel Foundation & Clinic",
      title: t.title,
      description: t.desc,
      images: [{ url: OG, width: 1200, height: 630, alt: t.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.desc,
      images: [OG],
    },
  };
}

export default function Page({ params }: { params: { locale: "en" | "lg" } }) {
  return <DonateClient locale={params.locale} />;
}
