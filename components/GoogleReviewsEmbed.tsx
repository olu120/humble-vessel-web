// components/GoogleReviewsSection.tsx
import Section from "@/components/Section";

export default function GoogleReviewsSection() {
  return (
    <Section title="Community voices" subtitle="See what patients, volunteers, and partners are saying about Humble Vessel Foundation & Clinic.">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white px-4 py-10 shadow-card">
        <div className="flex flex-col items-center gap-3 text-center text-sm text-gray-600">
          <p className="text-base font-medium">
            Google Reviews widget will appear here.
          </p>
          <p className="max-w-xl text-xs opacity-70">
            Once the Google Reviews integration is live, recent reviews and
            overall rating will be shown in this area.
          </p>
        </div>
      </div>
    </Section>
  );
}
