import Image from "next/image";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Reveal from "@/components/Reveal";

export default function OurStory({ locale, href }: { locale: "en" | "lg"; href: string }) {
  const title = locale === "lg" ? "Ebyafaayo byaffe" : "Our Story";
  const copy =
    locale === "lg"
      ? "Humble Vessel Foundation & Clinic yatandikibwa n’omulamwa omu: okuwa obuweereza obw’obulamu obwesigika eri bannansi abatali banyweza. Kaakano tukolera wamu n’abakulembeze b’omu bitundu okuzimba obulamu bw’eggwanga."
      : "Humble Vessel Foundation & Clinic began with a simple mission: bring compassionate, high-quality care to hard-to-reach communities. Today, our teams run regular clinics and partner with local leaders to improve long-term health outcomes.";

  return (
    <section className="py-8 md:py-12 bg-white">
      <Container className="grid gap-5 md:gap-6 md:grid-cols-2 items-center">
        <Reveal className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border">
          <Image
            src="/images/story.jpg"
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>
        <Reveal>
          <h2 className="text-lg md:text-2xl font-semibold">{title}</h2>
          <p className="mt-2 md:mt-3 text-[15px] md:text-base opacity-90">{copy}</p>
          <div className="mt-4 md:mt-5">
            <a href={href}>
              <Button>{locale === "lg" ? "Soma ebisingawo" : "Read our story"}</Button>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
