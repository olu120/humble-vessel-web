"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const PARTNERS = [
  { name: "Ministry of Health", logo: "/images/partners/ministry-health.png" },
  { name: "UNICEF", logo: "/images/partners/unicef.png" },
  { name: "Red Cross", logo: "/images/partners/redcross.png" },
  { name: "USAID", logo: "/images/partners/usaid.png" },
];

export default function PartnersStrip() {
  return (
    <section className="bg-white py-10 md:py-14 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-lg font-semibold mb-6 text-gray-700">
          Our Partners & Supporters
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-90">
          {PARTNERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Image
                src={p.logo}
                alt={p.name}
                width={120}
                height={60}
                className="grayscale hover:grayscale-0 transition duration-300"
                unoptimized
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
