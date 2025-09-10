import "../../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SUPPORTED = new Set(["en", "lg"]);

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // sanitize to our supported locales
  const raw = params.locale;
  const locale = SUPPORTED.has(raw) ? (raw as "en" | "lg") : "en";

  return (
    <html lang={locale}>
      <body className="antialiased">
        <Header locale={locale} />
        {children}
        <Footer />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "lg" }];
}
