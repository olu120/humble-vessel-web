// components/LeadershipHighlight.tsx
import Image from "next/image";

type Props = {
  founderName: string;
  founderTitle: string;
  founderBio: string;
  founderImage: string; // /images/founder.jpg
  teamImage: string;    // /images/team-group.jpg
};

export default function LeadershipHighlight({
  founderName,
  founderTitle,
  founderBio,
  founderImage,
  teamImage,
}: Props) {
  return (
    <section className="my-16 space-y-10">
      {/* Founder */}
      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center">
        <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl shadow-lg">
          <Image
            src={founderImage}
            alt={founderName}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
            Founder &amp; Vision
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{founderName}</h2>
          <p className="mt-1 text-sm font-medium opacity-80">{founderTitle}</p>
          <p className="mt-4 text-sm leading-relaxed opacity-90">
            {founderBio}
          </p>
        </div>
      </div>

      {/* Team group photo */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Our team</h3>
        <p className="text-sm opacity-80 max-w-2xl">
          Humble Vessel Foundation &amp; Clinic is powered by clinicians,
          outreach workers, and volunteers who serve together in clinics,
          communities, schools, and homes.
        </p>
        <div className="relative mt-4 aspect-[16/7] w-full overflow-hidden rounded-3xl shadow-lg">
          <Image
            src={teamImage}
            alt="Humble Vessel team"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
