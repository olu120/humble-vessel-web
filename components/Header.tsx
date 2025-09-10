import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import LanguageToggle from "./LanguageToggle";

export default function Header({ locale }: { locale: "en" | "lg" }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <Container className="flex items-center justify-between h-16">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="sr-only">Humble Vessel</span>
          <Image src="/images/logo.png" alt="Humble Vessel" width={170} height={36} className="hidden md:block" />
        </Link>

        <nav className="items-center hidden gap-6 md:flex">
          <Link href={`/${locale}/about`} className="hover:underline">About</Link>
          <Link href={`/${locale}/volunteer`} className="hover:underline">Volunteer</Link>
          <Link href={`/${locale}/donate`} className="hover:underline">Donate</Link>
          <LanguageToggle />
        </nav>

        <div className="md:hidden">
          <LanguageToggle />
        </div>
      </Container>
    </header>
  );
}
