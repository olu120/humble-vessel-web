// components/GiveCTA.tsx
import React from "react";
import Container from "./Container";
import Button from "./Button";

export default function GiveCTA({
  locale,
}: {
  locale: "en" | "lg";
}) {
  const copy =
    locale === "lg"
      ? {
          title: "Ebiweebwa byo biyamba buli clinic",
          sub: "Weereza ku lwa leero oba londa engeri endala z’okuyamba.",
          donate: "Weereza ssente",
          other: "Endala z’okuyamba",
        }
      : {
          title: "Your gift powers every clinic",
          sub: "Donate today or explore other ways to help.",
          donate: "Donate",
          other: "Other Ways to Help",
        };

  return (
    <section className="my-10 bg-[#1f8a4d] py-5 text-white rounded-2xl">
      <Container className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">{copy.title}</h3>
          <p className="text-sm opacity-90">{copy.sub}</p>
        </div>
        <div className="flex gap-3">
          <a href={`/${locale}/donate`}>
            <Button>{copy.donate}</Button>
          </a>
          <a href={`/${locale}/donate#other`}>
            <Button variant="secondary">{copy.other}</Button>
          </a>
        </div>
      </Container>
    </section>
  );
}
