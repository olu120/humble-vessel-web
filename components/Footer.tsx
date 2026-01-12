// components/Footer.tsx
import Container from "./Container";
import Link from "next/link";

export default function Footer({ locale = "en" }: { locale?: "en" | "lg" }) {
  const base = `/${locale}`;

  const t =
    locale === "lg"
      ? {
          title: "Humble Vessel Foundation & Clinic",
          desc:
            "Obujanjabi obukolebwa n’abantu b’eggwanga mu Bukasa, Wakiso District, Uganda. Obujanjabi obwangu, obwerufu n’ennkizo.",
          involved: "Wenyigiremu",
          donate: "Waayo",
          volunteer: "Weyanjule",
          whatsapp: "WhatsApp",
          contact: "Tuukirako",
          email: "Email",
          location: "Ekifo",
          quick: "Links",
          home: "Awaka",
          about: "Ebikukwatako",
          gallery: "Ebifaananyi",
          language: "Enkola y’olulimi",
          rights: "Humble Vessel",
        }
      : {
          title: "Humble Vessel Foundation & Clinic",
          desc:
            "Community-driven healthcare in Bukasa, Wakiso District, Uganda. Accessible care, transparency, and impact.",
          involved: "Get Involved",
          donate: "Donate",
          volunteer: "Volunteer",
          whatsapp: "WhatsApp",
          contact: "Contact",
          email: "Email",
          location: "Location",
          quick: "Quick links",
          home: "Home",
          about: "About",
          gallery: "Gallery",
          language: "Language",
          rights: "Humble Vessel",
        };

  return (
    <footer className="mt-16 text-white bg-brand-dark">
      <Container size="wide" className="py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand / About */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold">{t.title}</h3>
            <p className="max-w-xl mt-2 text-sm leading-relaxed opacity-80">
              {t.desc}
            </p>
          </div>

          {/* Get involved */}
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wide">{t.involved}</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href={`${base}/donate`} className="hover:underline">
                  {t.donate}
                </Link>
              </li>
              <li>
                <Link href={`${base}/volunteer`} className="hover:underline">
                  {t.volunteer}
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/256774381886"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.whatsapp}
                </a>
              </li>
            </ul>

            {/* Optional quick links (helps on mobile) */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold tracking-wide">{t.quick}</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>
                  <Link href={`${base}`} className="hover:underline">
                    {t.home}
                  </Link>
                </li>
                <li>
                  <Link href={`${base}/about`} className="hover:underline">
                    {t.about}
                  </Link>
                </li>
                <li>
                  <Link href={`${base}/gallery`} className="hover:underline">
                    {t.gallery}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wide">{t.contact}</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a
                  href="mailto:info@humblevesselfoundationandclinic.org"
                  className="break-all hover:underline"
                >
                  info@humblevesselfoundationandclinic.org
                </a>
              </li>
              <li className="opacity-90">Bukasa, Wakiso District</li>
            </ul>

            {/* Simple language links (responsive + actually useful) */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold tracking-wide">{t.language}</h4>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/en"
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    locale === "en"
                      ? "bg-white text-brand-dark"
                      : "bg-transparent text-white hover:bg-white/10"
                  }`}
                >
                  EN
                </Link>
                <Link
                  href="/lg"
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    locale === "lg"
                      ? "bg-white text-brand-dark"
                      : "bg-transparent text-white hover:bg-white/10"
                  }`}
                >
                  LG
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/20">
        <Container
          size="wide"
          className="flex flex-col gap-2 py-4 text-sm opacity-80 md:flex-row md:items-center md:justify-between"
        >
          <span>
            © {new Date().getFullYear()} {t.rights}
          </span>
          <span className="text-xs md:text-sm">
            {locale === "lg" ? "Eddembe lyonna liweereddwa." : "All rights reserved."}
          </span>
        </Container>
      </div>
    </footer>
  );
}
