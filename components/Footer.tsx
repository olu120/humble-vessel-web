// components/Footer.tsx
import Container from "./Container";
import Link from "next/link";

export default function Footer({ locale = "en" }: { locale?: "en" | "lg" }) {
  const base = `/${locale}`;
  return (
    <footer className="mt-16 text-white bg-brand-dark">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold">
            Humble Vessel Foundation &amp; Clinic
          </h3>
          <p className="mt-2 opacity-80">
            Community-driven healthcare in Bukasa, Wakiso District, Uganda.
            Accessible care, transparency, and impact.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Get Involved</h4>
          <ul className="space-y-2 opacity-90">
            <li>
              <Link href={`${base}/donate`} className="hover:underline">
                Donate
              </Link>
            </li>
            <li>
              <Link href={`${base}/volunteer`} className="hover:underline">
                Volunteer
              </Link>
            </li>
            <li>
              <a
                href="https://wa.me/256774381886"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Contact</h4>
          <ul className="space-y-2 opacity-90">
            <li>
              <a
                href="mailto:info@humblevesselfoundationandclinic.org"
                className="hover:underline"
              >
                info@humblevesselfoundationandclinic.org
              </a>
            </li>
            <li>Bukasa, Wakiso District</li>
          </ul>
        </div>
      </Container>

      <div className="bg-black/20">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-sm opacity-80">
          <span>© {new Date().getFullYear()} Humble Vessel</span>
          <span>EN • LG</span>
        </Container>
      </div>
    </footer>
  );
}
