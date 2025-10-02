"use client";
import { useState } from "react";
import Section from "@/components/Section";
import Button from "@/components/Button";

const presetsLocal = [10000, 20000, 50000, 100000]; // UGX examples
const presetsIntl = [100, 150, 200, 300]; // USD

export default function DonateClient({ locale }: { locale: "en" | "lg" }) {
  const [tab, setTab] = useState<"local" | "intl">("local");
  const [amount, setAmount] = useState<number | "">("");
  const [error, setError] = useState<string>("");

  const handlePreset = (v: number) => {
    setAmount(v);
    setError("");
  };

  const validateAndContinue = () => {
    setError("");
    const val = Number(amount);
    if (tab === "intl") {
      if (!val || val < 100) {
        setError("International donations must be at least $100.");
        return;
      }
    } else {
      if (!val) {
        setError("Please choose or enter an amount.");
        return;
      }
    }
    const params = new URLSearchParams({ tab, amount: String(val) });
    const currentLocale = locale || (location.pathname.split("/")[1] as "en" | "lg") || "en";
    window.location.href = `/${currentLocale}/donate/checkout?${params.toString()}`;
  };

  const Presets = ({ values }: { values: number[] }) => (
    <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
      {values.map((v) => (
        <button
          key={v}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            amount === v ? "border-brand-blue ring-2 ring-brand-blue/20" : "hover:border-brand-blue"
          }`}
          onClick={() => handlePreset(v)}
        >
          {tab === "intl" ? `$${v}` : `UGX ${v.toLocaleString()}`}
        </button>
      ))}
    </div>
  );

  return (
    <main>
      <Section
        title={locale === "lg" ? "Weereza obuyambi" : "Donate"}
        subtitle={locale === "lg" ? "Londako wano mu Uganda oba International" : "Choose local or international giving"}
      >
        {/* Tabs */}
        <div className="inline-flex overflow-hidden border rounded-2xl">
          <button
            className={`px-4 py-2 ${tab === "local" ? "bg-brand-blue text-white" : ""}`}
            onClick={() => {
              setTab("local");
              setAmount("");
              setError("");
            }}
          >
            {locale === "lg" ? "Wano (UGX)" : "Local (UGX)"}
          </button>
          <button
            className={`px-4 py-2 ${tab === "intl" ? "bg-brand-blue text-white" : ""}`}
            onClick={() => {
              setTab("intl");
              setAmount("");
              setError("");
            }}
          >
            {locale === "lg" ? "International (USD)" : "International (USD)"}
          </button>
        </div>

        {/* Presets */}
        <Presets values={tab === "intl" ? presetsIntl : presetsLocal} />

        {/* Custom amount */}
        <div className="mt-6">
          <label className="block mb-1 text-sm">
            {locale === "lg" ? "Omuwendo gwo" : "Custom amount"}
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-2xl bg-brand-light">
              {tab === "intl" ? "$" : "UGX"}
            </span>
            <input
              inputMode="numeric"
              pattern="\d*"
              placeholder={tab === "intl" ? "100" : "50000"}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || "")}
              className="w-40 px-4 py-2 border rounded-2xl"
            />
          </div>
          {tab === "intl" && (
            <p className="mt-1 text-xs opacity-70">
              {locale === "lg"
                ? "International donations zisaanira okuba wa waggulu wa $100."
                : "Minimum $100 applies to international donations."}
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Continue */}
        <div className="mt-6">
          <Button onClick={validateAndContinue}>
            {locale === "lg" ? "Weyongereyo" : "Continue"}
          </Button>
        </div>

        {/* FAQ (wireframe) */}
        <div className="mt-10">
          <h3 className="mb-3 text-lg font-semibold">{locale === "lg" ? "Ebibuuzo ebisinga" : "FAQs"}</h3>
          <details className="p-4 mb-2 border rounded-2xl">
            <summary className="font-medium cursor-pointer">
              {locale === "lg" ? "Ensasula zikoze bwa ntya?" : "How are donations used?"}
            </summary>
            <p className="mt-2 text-sm opacity-80">
              {locale === "lg"
                ? "Ensasula ziyamba ku bikolwa by’eddwaliro, eddagala, n’obutongole obulabirira abantu."
                : "Funds support clinic operations, medicines, outreach, and community programs."}
            </p>
          </details>
          <details className="p-4 border rounded-2xl">
            <summary className="font-medium cursor-pointer">
              {locale === "lg" ? "Nnaweebwa risiti?" : "Will I receive a receipt?"}
            </summary>
            <p className="mt-2 text-sm opacity-80">
              {locale === "lg"
                ? "Yee—olifuna email risiti oluvannyuma lw’okusasula (guno gujja mu Phase 3)."
                : "Yes—an email receipt is issued after payment (added in Phase 3)."}
            </p>
          </details>
        </div>
      </Section>
    </main>
  );
}
