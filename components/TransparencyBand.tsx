"use client";

import { motion } from "framer-motion";
import Button from "@/components/Button";

type Props = {
  locale: "en" | "lg";
  href?: string; // allow override if you change the route later
};

export default function TransparencyBand({ locale, href }: Props) {
  const t =
    locale === "lg"
      ? {
          title: "Obwenkanya n’Obuweereza Obulabiseeko",
          desc:
            "Tuwandiika buli ssente ezituyitirako okuva mu nsasula okutuuka ku byatwaliddwa ku bantu n’eddwaaliro.",
          cta: "Laba engeri ssente gye zikoleddwa",
        }
      : {
          title: "Transparency & Impact",
          desc:
            "We publish where donations go from incoming funds to real-world care delivered.",
          cta: "See how your gift is used",
        };

  const url = href || `/${locale}/about/transparency`;

  return (
    <section className="py-10 md:py-14 bg-gradient-to-r from-brand-light/60 to-white border-t">
      <div className="max-w-6xl mx-auto px-6 grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold">{t.title}</h2>
          <p className="mt-2 text-sm md:text-base opacity-80">{t.desc}</p>
        </motion.div>

        <motion.div
          className="md:text-right"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <a href={url}>
            <Button>{t.cta}</Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
