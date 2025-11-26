"use client";

import { useState } from "react";
import Section from "@/components/Section";
import Button from "@/components/Button";

type Cadence = "one_time" | "weekly" | "biweekly" | "monthly";

const presetsLocal = [10000, 20000, 50000, 100000]; // UGX examples
const presetsIntl = [100, 150, 200, 300]; // USD

export default function DonateClient() {
  const [tab, setTab] = useState<"local" | "intl">("local");
  const [amount, setAmount] = useState<number | "">("");
  const [cadence, setCadence] = useState<Cadence>("one_time");
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
        setError("International donations must be at least $100 (or equivalent).");
        return;
      }
    } else {
      if (!val) {
        setError("Please choose or enter an amount.");
        return;
      }
    }

    const params = new URLSearchParams({
      tab,
      amount: String(val),
      cadence, // pass to checkout
    });

    const locale = (location.pathname.split("/")[1] || "en");
    window.location.href = `/${locale}/donate/checkout?${params.toString()}`;
  };

  const Presets = ({ values }: { values: number[] }) => (
    <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
      {values.map((v) => (
        <button
          key={v}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            amount === v
              ? "border-brand-blue ring-2 ring-brand-blue/20"
              : "hover:border-brand-blue"
          }`}
          onClick={() => handlePreset(v)}
          type="button"
        >
          {tab === "intl" ? `$${v}` : `UGX ${v.toLocaleString()}`}
        </button>
      ))}
    </div>
  );

  return (
    <main>
      <Section
        title="Donate"
        subtitle="Choose the easiest way to give — locally in UGX or internationally by bank transfer."
      >
        {/* Tabs */}
        <div className="inline-flex overflow-hidden border rounded-2xl bg-white">
          <button
            type="button"
            className={`px-4 py-2 text-sm md:text-base ${
              tab === "local"
                ? "bg-brand-blue text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => {
              setTab("local");
              setAmount("");
              setError("");
            }}
          >
            Local (UGX)
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm md:text-base ${
              tab === "intl"
                ? "bg-brand-blue text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => {
              setTab("intl");
              setAmount("");
              setError("");
            }}
          >
            International (Bank transfer)
          </button>
        </div>

        {/* Short explanations under tabs */}
        <div className="mt-3 text-xs md:text-sm text-gray-700 space-y-1">
          {tab === "local" ? (
            <>
              <p>
                <strong>Local (UGX):</strong> Give using Mobile Money within Uganda.
              </p>
              <p>We’ll send you simple Airtel payment instructions and a receipt.</p>
            </>
          ) : (
            <>
              <p>
                <strong>International (bank transfer):</strong> We’ll email you SWIFT
                bank details and a PDF with all instructions.
              </p>
              <p>
                Your bank can send from <em>any currency</em>; the funds arrive in
                Uganda in UGX.
              </p>
            </>
          )}
        </div>

        {/* Important notice for international donations */}
        {tab === "intl" && (
          <div className="mt-4 rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-xs md:text-sm text-gray-800">
            <p className="font-semibold">Important for international donors</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>
                Minimum international donation is{" "}
                <strong>$100 (or equivalent)</strong>.
              </li>
              <li>
                Our receiving bank charges a fixed fee (around{" "}
                <strong>$50</strong>) when funds arrive in Uganda.
              </li>
              <li>
                You&#39;ll receive a clear PDF with the exact bank details and a
                reference to include.
              </li>
            </ul>
          </div>
        )}

        {/* Presets */}
        <Presets values={tab === "intl" ? presetsIntl : presetsLocal} />

        {/* Custom amount */}
        <div className="mt-6">
          <label className="block mb-1 text-sm font-medium">Custom amount</label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-2xl bg-brand-light text-sm">
              {tab === "intl" ? "$" : "UGX"}
            </span>
            <input
              inputMode="numeric"
              pattern="\d*"
              placeholder={tab === "intl" ? "100" : "50000"}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || "")}
              className="w-40 px-4 py-2 border rounded-2xl text-sm md:text-base"
            />
          </div>
          {tab === "intl" && (
            <p className="mt-1 text-xs opacity-70">
              Minimum <strong>$100</strong> applies to international donations.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Recurring cadence */}
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium">
            Donation frequency
          </label>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 cursor-pointer text-sm">
              <input
                type="radio"
                name="cadence"
                value="one_time"
                checked={cadence === "one_time"}
                onChange={() => setCadence("one_time")}
              />
              <span>One-time</span>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 cursor-pointer text-sm">
              <input
                type="radio"
                name="cadence"
                value="weekly"
                checked={cadence === "weekly"}
                onChange={() => setCadence("weekly")}
              />
              <span>Weekly</span>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 cursor-pointer text-sm">
              <input
                type="radio"
                name="cadence"
                value="biweekly"
                checked={cadence === "biweekly"}
                onChange={() => setCadence("biweekly")}
              />
              <span>Bi-weekly</span>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 cursor-pointer text-sm">
              <input
                type="radio"
                name="cadence"
                value="monthly"
                checked={cadence === "monthly"}
                onChange={() => setCadence("monthly")}
              />
              <span>Monthly</span>
            </label>
          </div>
          <p className="mt-2 text-xs opacity-70">
            We’ll record your preference in our system. Payments are{" "}
            <strong>not auto-debited</strong> yet — a team member may contact you to
            help set up a standing order or follow-up.
          </p>
        </div>

        {/* Continue */}
        <div className="mt-6">
          <Button onClick={validateAndContinue}>Continue</Button>
        </div>

        {/* FAQ (wireframe) */}
        <div className="mt-10">
          <h3 className="mb-3 text-lg font-semibold">FAQs</h3>
          <details className="p-4 mb-2 border rounded-2xl">
            <summary className="font-medium cursor-pointer">
              How are donations used?
            </summary>
            <p className="mt-2 text-sm opacity-80">
              Funds support clinic operations, medicines, outreach, and community
              programs.
            </p>
          </details>
          <details className="p-4 border rounded-2xl">
            <summary className="font-medium cursor-pointer">
              Will I receive a receipt?
            </summary>
            <p className="mt-2 text-sm opacity-80">
              Yes — an email receipt is issued after payment.
            </p>
          </details>
        </div>
      </Section>
    </main>
  );
}
