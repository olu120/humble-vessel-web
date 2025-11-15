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
      <section className="bg-green-600 text-white py-4">
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
            className="px-5 py-2 bg-white text-green-700 font-medium rounded-full hover:bg-green-50 transition"
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
                <div className="text-sm font-medium text-gray-500 w-16 shrink-0">
                  {item.year}
                </div>
                <div className="flex-1 p-4 bg-white rounded-2xl shadow-sm">
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
                <div className="p-4 bg-white rounded-2xl shadow text-center">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs opacity-70">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal y={8} delay={220}>
            <div className="overflow-hidden rounded-2xl shadow-md">
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

      {/* Leadership */}
      <Section title="Leadership" bg="alt">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            {
              name: "Dr. Charlse",
              role: "Founder & Director",
              text: "Community physician leading strategy and partnerships.",
              img: "/images/team/Charlse.jpg",
            },
            {
              name: "James O.",
              role: "Programs Lead",
              text: "Oversees clinics and volunteer coordination.",
              img: "/images/team/james.jpg",
            },
            {
              name: "Grace N.",
              role: "Maternal Health",
              text: "Leads maternal care and safe delivery initiatives.",
              img: "/images/team/grace.jpg",
            },
            {
              name: "Peter M.",
              role: "Operations",
              text: "Manages logistics and partnerships on the ground.",
              img: "/images/team/peter.jpg",
            },
          ].map((p, i) => (
            <Reveal key={p.name} delay={i * 90} y={10}>
              <div className="p-4 bg-white rounded-2xl shadow text-center">
                <Image
                  src={p.img}
                  alt={p.name}
                  width={80}
                  height={80}
                  className="mx-auto mb-2 rounded-full object-cover"
                />
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-sm text-brand-blue">{p.role}</p>
                <p className="mt-1 text-xs opacity-80">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Transparency & Reviews — reuse the same reviews component */}
      <Reveal y={10}>
        <TestimonialsSection items={reviewCards} title="Transparency & Reviews" />
      </Reveal>
    </main>
  );
}
