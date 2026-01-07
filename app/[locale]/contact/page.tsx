import Container from "@/components/Container";
import Section from "@/components/Section";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import TestimonialsSection from "@/components/TestimonialsSection";
import { getApprovedReviews } from "@/lib/wp";

export const metadata = {
  title: "Contact | Humble Vessel Foundation & Clinic",
  description:
    "Have questions? Contact us via WhatsApp, email, or visit our clinic offices.",
};

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  const raw = params.locale;
  const locale = raw === "lg" ? "lg" : "en";
  const dict = await getDictionary(locale);

  // Pull the same reviews you show on the homepage
  const reviews = await getApprovedReviews();
  const reviewCards =
    (reviews || []).slice(0, 6).map((r: any) => ({
      id: r.id,
      name: r.acf?.reviewer_name || "Anonymous",
      rating: r.acf?.rating,
      comment: r.acf?.comment,
    })) || [];

  return (
    <main>
      {/* WhatsApp CTA Banner */}
      <section className="py-4 text-white bg-green-600">
        <Container className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-lg font-semibold">Have questions?</h2>
            <p className="text-sm opacity-90">
              Chat with us on WhatsApp — we’ll guide you.
            </p>
          </div>
          <a
            href="https://wa.me/256774381886"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 font-medium text-green-700 transition bg-white rounded-full hover:bg-green-50"
          >
            WhatsApp
          </a>
        </Container>
      </section>

      {/* Mission */}
      <Section title="Our Mission">
        <Reveal y={8}>
          <p className="max-w-2xl">
            To deliver accessible, high-quality healthcare and health education
            to underserved communities in Uganda.
          </p>
        </Reveal>
      </Section>

      {/* Our Story Timeline */}
      <Section title="Our Story" bg="alt">
        <div className="grid gap-4 md:gap-6">
          {[
            {
              year: 2017,
              title: "Founded",
              text: "Started first community outreach in Kampala.",
            },
            {
              year: 2019,
              title: "Mobile Clinics",
              text: "Launched mobile clinic program expanding to rural districts.",
            },
            {
              year: 2022,
              title: "Maternal Care",
              text: "Introduced maternal health services and safe delivery kits.",
            },
            {
              year: 2024,
              title: "Scaling Impact",
              text: "Reached over 25,000 patients served.",
            },
          ].map((item, i) => (
            <Reveal key={item.year} y={10} delay={i * 90}>
              <div className="flex items-start gap-6">
                <div className="w-16 text-sm font-medium text-gray-500 shrink-0">
                  {item.year}
                </div>
                <div className="flex-1 p-4 bg-white shadow-sm rounded-2xl">
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm opacity-80">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Impact Stats + Map */}
      <Section title="Impact & Where We Work">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Patients", value: "25k+" },
              { label: "Districts", value: "12" },
              { label: "Clinics", value: "180" },
              { label: "Volunteers", value: "420" },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80} y={8}>
                <div className="p-4 text-center bg-white shadow rounded-2xl">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs opacity-70">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal y={8} delay={220}>
            <div className="overflow-hidden shadow-md rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8867380121!2d32.0251!3d0.3304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177da67c88d7b7b1%3A0x1c2cd5626b4042d!2sMityana!5e0!3m2!1sen!2sug!4v1698514000000"
                width="100%"
                height="250"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Leadership (Founder big + Team group photo) */}
      <Section title="Leadership" bg="alt">
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          {/* Founder card (bigger) */}
          <Reveal y={10}>
            <div className="p-6 bg-white shadow lg:col-span-2 rounded-2xl">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <Image
                  src="/images/team/Charlse.jpg"
                  alt="Dr. Charlse"
                  width={160}
                  height={160}
                  className="object-cover rounded-2xl"
                />
                <div className="text-center sm:text-left">
                  <h4 className="text-xl font-semibold md:text-2xl">
                    Dr. Charlse
                  </h4>
                  <p className="text-sm font-medium md:text-base text-brand-blue">
                    Founder & Director
                  </p>
                  <p className="max-w-xl mt-2 text-sm opacity-80">
                    Community physician leading strategy, partnerships, and
                    program direction to improve access to care across Mityana
                    and beyond.
                  </p>

                  {/* Optional quick highlights */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4 sm:justify-start">
                    <span className="px-3 py-1 text-xs bg-gray-100 rounded-full">
                      Strategy
                    </span>
                    <span className="px-3 py-1 text-xs bg-gray-100 rounded-full">
                      Partnerships
                    </span>
                    <span className="px-3 py-1 text-xs bg-gray-100 rounded-full">
                      Community care
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Team group photo card */}
          <Reveal y={10} delay={90}>
            <div className="flex flex-col p-6 text-center bg-white shadow rounded-2xl">
              <h4 className="text-lg font-semibold">Team</h4>
              <p className="text-sm text-brand-blue">
                Programs • Maternal Health • Operations
              </p>

              <div className="mt-4 overflow-hidden bg-gray-100 rounded-2xl">
                {/* Replace this with your actual group photo path */}
                <Image
                  src="/images/hero-2.jpg"
                  alt="Humble Vessel team group photo"
                  width={800}
                  height={600}
                  className="w-full h-[220px] object-cover"
                />
              </div>

              <p className="mt-3 text-xs opacity-80">
                A dedicated group supporting clinics, outreach, logistics and
                maternal health initiatives.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Transparency & Reviews — reuse the same reviews component */}
      <Reveal y={10}>
        <TestimonialsSection items={reviewCards} title="Transparency & Reviews" />
      </Reveal>
    </main>
  );
}
