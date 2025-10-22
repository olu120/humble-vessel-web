"use client";

import { motion } from "framer-motion";

const IMPACTS = [
  { label: "Patients served", value: "12,400+" },
  { label: "Volunteers mobilized", value: "180+" },
  { label: "Outreach clinics held", value: "65+" },
  { label: "Medicines distributed", value: "20,000+" },
];

export default function ImpactStrip() {
  return (
    <section className="bg-brand-blue text-white py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-6 grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-center">
        {IMPACTS.map((i, idx) => (
          <motion.div
            key={i.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <p className="text-3xl font-semibold">{i.value}</p>
            <p className="mt-1 text-sm opacity-90">{i.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
