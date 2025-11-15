import Container from "@/components/Container";
import Reveal from "@/components/Reveal";

export default function MissionVision({ locale }: { locale: "en" | "lg" }) {
  // English copy as provided (kept concise for homepage)
  const mission = [
    "Provide accessible, high-quality, compassionate healthcare for individuals and families.",
    "Serve every patient with a professional, innovative and holistic approach, regardless of income.",
    "Promote and teach wellness to build healthier communities across Uganda.",
  ];
  const vision = [
    "Build healthier, stronger communities where everyone can access the care they need.",
    "Reduce common diseases through education and excellent medical treatment.",
    "Increase knowledge to improve physical, mental and emotional wellness without barriers or discrimination.",
  ];

  const titleMission = locale === "lg" ? "Omulimu gwaffe" : "Our Mission";
  const titleVision  = locale === "lg" ? "Okulaba kwaffe" : "Our Vision";

  return (
    <section className="py-8 md:py-12 bg-white">
      <Container className="grid gap-6 md:grid-cols-2">
        <Reveal className="rounded-2xl border p-5 bg-white shadow-sm">
          <h2 className="text-lg md:text-2xl font-semibold">{titleMission}</h2>
          <ul className="mt-3 space-y-2 text-sm md:text-[15px] opacity-90 list-disc pl-5">
            {mission.map((m, i) => (<li key={i}>{m}</li>))}
          </ul>
        </Reveal>
        <Reveal className="rounded-2xl border p-5 bg-white shadow-sm">
          <h2 className="text-lg md:text-2xl font-semibold">{titleVision}</h2>
          <ul className="mt-3 space-y-2 text-sm md:text-[15px] opacity-90 list-disc pl-5">
            {vision.map((v, i) => (<li key={i}>{v}</li>))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
