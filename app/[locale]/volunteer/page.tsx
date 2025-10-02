// NO "use client" here
import type { Metadata } from "next";
import VolunteerClient from "./VolunteerClient";

const SITE = "https://humblevesselfoundationandclinic.org";
const OG = "/og-volunteer.jpg"; // place a nice image in /public

export async function generateMetadata(
  { params }: { params: { locale: "en" | "lg" } }
): Promise<Metadata> {
  const { locale } = params;
  const t =
    locale === "lg"
      ? {
          title: "Weyambise mu nteekateeka | Humble Vessel Foundation & Clinic",
          desc:
            "Weyongera ku buli kya mugaso—yambako mu by’obulamu n’obwenkanya mu Uganda.",
        }
      : {
          title: "Volunteer | Humble Vessel Foundation & Clinic",
          desc:
            "Join our mission and volunteer to support healthcare and justice in Uganda.",
        };

  return {
    title: t.title,
    description: t.desc,
    openGraph: {
      type: "website",
      url: `${SITE}/${locale}/volunteer`,
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
  return <VolunteerClient locale={params.locale} />;
}
