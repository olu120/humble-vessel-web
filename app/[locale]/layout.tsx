import "../../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // params is async in latest Next; type as Promise and await it
  params: Promise<{ locale: "en" | "lg" }>;
}) {
  const { locale } = await params;

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

// Prebuild both locales (also fine to keep this in page.tsx; either is OK)
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "lg" }];
}
