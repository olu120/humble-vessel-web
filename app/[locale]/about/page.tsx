// app/[locale]/about/page.tsx
import Image from "next/image";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Button from "@/components/Button";
import ImpactStrip from "@/components/ImpactStrip";
import TransparencyBand from "@/components/TransparencyBand";
import PartnersStrip from "@/components/PartnersStrip";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

type Locale = "en" | "lg";

export default async function AboutPage({
  params,
}: { params: { locale: string } }) {
  const locale: Locale = params.locale === "lg" ? "lg" : "en";

  const t = locale === "lg"
    ? {
        heroTitle: "Ebifa ku Humble Vessel Foundation & Clinic",
        heroSub:
          "Tutekera wamu eby’obujjanjabi eby’ensawo n’okuyamba mu bantu okufuna obulamu obulungi mu bitundu byo Uganda.",
        missionH: "Omulamwa gwaffe",
        mission:
          "Okuweereza obujjanjabi obutuukika, obw’olangirizi era obw’okusasulibwa ku bantu bonna n’ab’eŋŋanda zaabwe nga tukozesa enkola ey’obukugu, ey’amagezi, n’ey’omubiri gwonna, wadde ku mudidi gw’ebyenfuna.",
        visionH: "Olulaba lw’obufuzi",
        vision:
          "Okuzimba ebyalo n’emitendera egy’amaanyi gy’awalukuka obulwadde; buli muntu afune obujjanjabi obwetaagisa, awatali kusosola.",
        timelineH: "Akatambi k’ebyafaayo",
        impactH: "Obuyambi n’ewaffe gye tukolera",
        leadershipH: "Abakulira omulimu",
        ctaH: "Olina ebibuuzo?",
        ctaP:
          "Tukubirako oba tuwereze ku WhatsApp tusanyuka okuyamba.",
        contact: "Tukolagane",
        donate: "Guza kati",
      }
    : {
        heroTitle: "About Humble Vessel Foundation & Clinic",
        heroSub:
          "We deliver compassionate, high-quality care and health education in Uganda rooted in community and transparency.", 
        missionH: "Our Mission",
        mission:
          "To provide accessible, high-quality and compassionate health care to individuals and families. We serve each patient with a professional, innovative, holistic approach, ardless of economic status, and promote wellness that builds healthier communities.",
        visionH: "Our Vision",
        vision:
          "Stronger communities where everyone can access the care they need; fewer preventable diseases through education and excellent treatment; and greater understanding of physical, mental and emotional wellness without barriers or discrimination.",
        timelineH: "Our Story",
        impactH: "Impact & Where We Work",
        leadershipH: "Leadership",
        ctaH: "Have questions?",
        ctaP:
          "Message us on WhatsApp or get in touch. We’re happy to help.",
        contact: "Contact us",
        donate: "Donate",
      };

  // Local images you’ll add under /public/images/about/
  const heroImg = "/images/hero-2.jpg"; // wide team/outreach photo
  const leaderImgs = {
  founder: "/images/team/charlse.jpg", // add this image
  team: "/images/hero-2.jpg",              // add this image (group photo)
};

  const missionVision = [
    { title: t.missionH, text: t.mission },
    { title: t.visionH, text: t.vision },
  ];

  const timeline = [
    { year: "2017", title: "Founded", text: "Started our first community outreach in Kampala." },
    { year: "2019", title: "Mobile Clinics", text: "Launched outreach clinics to reach rural communities." },
    { year: "2022", title: "Maternal Care", text: "Expanded maternal services and safe delivery kits." },
    { year: "2024", title: "Scaling Impact", text: "Served 25,000+ patients across multiple districts." },
  ];

  const impactStats =
  locale === "lg"
    ? [
        { label: "Abeefunyiddwa obuweereza", value: 25300, approx: true },
        { label: "Ebitundu by’okusomesa", value: 180, approx: false },
        { label: "Abeyambako", value: 420, approx: false },
        { label: "Ebitundu ebyatuukiddwako", value: 12, approx: false },
      ]
    : [
        { label: "Patients Served", value: 25300, approx: true },
        { label: "Clinics Held", value: 180, approx: false },
        { label: "Volunteers", value: 420, approx: false },
        { label: "Districts Reached", value: 12, approx: false },
      ];


  const founder = {
  img: leaderImgs.founder,
  name: locale === "lg" ? "Visioneer wa Mukago" : "Visioneer & Founder",
  displayName: "Dr. Amina K.",
  blurb:
    locale === "lg"
      ? "Akulembera okulaba nti obuweereza bwegatta ku bantu, era bulimu obwesigwa n’okukung’aanya."
      : "Leads a vision of community-rooted, transparent care, ensuring excellence across clinics and outreach.",
};

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative h-[42vh] md:h-[56vh]">
          <Image
            src={heroImg}
            alt="Humble Vessel — community care"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <Container className="relative z-10 grid h-full place-items-center text-center text-white">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold md:text-5xl">{t.heroTitle}</h1>
              <p className="mt-3 opacity-90">{t.heroSub}</p>
            </div>
          </Container>
        </div>
        <div className="w-full h-1 bg-brand-yellow" />
      </section>

      {/* MISSION & VISION */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {missionVision.map((m) => (
            <Reveal key={m.title} y={10}>
              <div className="h-full p-6 bg-white rounded-2xl shadow-card">
                <h2 className="mb-2 text-xl font-semibold">{m.title}</h2>
                <p className="opacity-90">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* TIMELINE */}
      <Section title={t.leadershipH}>
  <div className="grid gap-6 lg:grid-cols-3">
    {/* Founder card */}
    <div className="p-6 bg-white rounded-2xl shadow-card">
      <div className="flex items-center gap-4">
        <Image
          src={founder.img}
          alt={founder.displayName}
          width={80}
          height={80}
          className="rounded-full object-cover h-20 w-20"
        />
        <div>
          <div className="text-lg font-semibold">{founder.displayName}</div>
          <div className="text-sm opacity-70">{founder.name}</div>
        </div>
      </div>
      <p className="mt-3 text-sm opacity-90">{founder.blurb}</p>
    </div>

    {/* Group photo (spans 2 columns on large) */}
    <div className="overflow-hidden rounded-2xl shadow-card lg:col-span-2">
      <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-full">
        <Image
          src={leaderImgs.team}
          alt="Humble Vessel team"
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-sm text-white bg-gradient-to-t from-black/50">
          {locale === "lg"
            ? "Ekifaananyi ky’ekibiina ky’abaweereza baffe mu lukungaana lwa kliniki"
            : "Our clinical and outreach team during a community clinic"}
        </div>
      </div>
    </div>
  </div>
</Section>


      {/* TRANSPARENCY */}
      <TransparencyBand locale={locale} />

      {/* CTA strip */}
      <Section>
        <div className="flex flex-col items-center justify-between gap-4 p-6 rounded-2xl bg-emerald-600 md:flex-row">
          <div className="text-white">
            <div className="text-lg font-semibold">{t.ctaH}</div>
            <p className="opacity-90">{t.ctaP}</p>
          </div>
          <div className="flex gap-3">
            <a href={`/${locale}/contact`}>
              <Button variant="secondary">{t.contact}</Button>
            </a>
            <a href={`/${locale}/donate`}>
              <Button>{t.donate}</Button>
            </a>
          </div>
        </div>
      </Section>

      {/* Partners */}
      <PartnersStrip />
    </main>
  );
}
