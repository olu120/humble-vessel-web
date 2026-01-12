// components/GoogleReviewsEmbed.tsx (or GoogleReviewsSection.tsx)
import Section from "@/components/Section";

export default function GoogleReviewsEmbed() {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL || "";
  const reviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "";

  // If not configured, keep your placeholder (so build never breaks)
  if (!embedUrl) {
    return (
      <Section
        title="Community voices"
        subtitle="See what patients, volunteers, and partners are saying about Humble Vessel Foundation & Clinic."
      >
        <div className="max-w-4xl px-4 py-10 mx-auto bg-white border rounded-3xl shadow-card">
          <div className="flex flex-col items-center gap-3 text-sm text-center text-gray-600">
            <p className="text-base font-medium">
              Google Reviews widget will appear here.
            </p>
            <p className="max-w-xl text-xs opacity-70">
              Add NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL to show the map + rating, and NEXT_PUBLIC_GOOGLE_REVIEW_URL for the button.
            </p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section
      title="Community voices"
      subtitle="See what patients, volunteers, and partners are saying about Humble Vessel Foundation & Clinic."
    >
      <div className="max-w-5xl mx-auto overflow-hidden bg-white border rounded-3xl shadow-card">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-600">
              View our rating and reviews on Google.
            </p>
          </div>

          {reviewUrl ? (
            <div className="flex flex-wrap gap-2">
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-2xl bg-brand-blue hover:brightness-110"
              >
                Read reviews
              </a>
              <a
                href={`${reviewUrl}?review=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold border rounded-2xl hover:bg-gray-50"
              >
                Write a review
              </a>
            </div>
          ) : null}
        </div>

        <div className="relative aspect-[16/9] w-full bg-gray-100">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Reviews / Map"
          />
        </div>
      </div>
    </Section>
  );
}
