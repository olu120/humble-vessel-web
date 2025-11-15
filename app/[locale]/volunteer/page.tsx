// app/[locale]/volunteer/page.tsx
"use client";

import { useRef, useState } from "react";
import Section from "@/components/Section";
import Button from "@/components/Button";

type FormState = {
  first: string;
  last: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
};

export default function VolunteerPage() {
  const [form, setForm] = useState<FormState>({
    first: "",
    last: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 👇 Properly typed form ref so scrollIntoView is valid
  const formRef = useRef<HTMLFormElement | null>(null);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.first || !form.last || !form.email) {
      setError("Please fill in first name, last name and email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/volunteer/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first: form.first,
          last: form.last,
          email: form.email,
          phone: form.phone,
          interest: form.interest,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No route was found matching the URL and request method.");
      }

      setOk(true);
      setForm({
        first: "",
        last: "",
        email: "",
        phone: "",
        interest: "",
        message: "",
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* Top hero strip */}
      <Section
        title="Volunteer with Us"
        subtitle="Join our mission to bring compassionate care to communities in Uganda."
      >
        <Button onClick={scrollToForm}>Start application</Button>
      </Section>

      {/* How it works */}
      <Section title="How It Works">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <p className="text-sm font-semibold">1. Apply</p>
            <p className="mt-1 text-sm opacity-80">
              Submit your details, preferred role, and availability.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <p className="text-sm font-semibold">2. Review</p>
            <p className="mt-1 text-sm opacity-80">
              Our team reviews applications and contacts shortlisted candidates.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <p className="text-sm font-semibold">3. Onboard</p>
            <p className="mt-1 text-sm opacity-80">
              Attend orientation and begin your volunteer journey.
            </p>
          </div>
        </div>
      </Section>

      {/* Open roles */}
      <Section title="Open Roles">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-semibold">Medical Volunteer</p>
            <p className="mt-1 text-sm opacity-80">
              Support clinics, patient care and basic triage (under supervision).
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-semibold">Outreach Coordinator</p>
            <p className="mt-1 text-sm opacity-80">
              Lead health education and community mobilization.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-semibold">Logistics Support</p>
            <p className="mt-1 text-sm opacity-80">
              Assist with transport, supplies and clinic setup.
            </p>
          </div>
        </div>
      </Section>

      {/* Eligibility & requirements */}
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">Eligibility</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-85">
              <li>18 years or older</li>
              <li>Passion for community service</li>
              <li>Relevant experience preferred</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Requirements</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-85">
              <li>Valid ID and references</li>
              <li>Availability for scheduled clinics</li>
              <li>Adherence to safety protocols</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Application form */}
      <Section
        title="Application Form"
        subtitle="Share your details and preferences. We’ll get back to you."
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">First name</label>
              <input
                className="w-full rounded-2xl border px-4 py-2"
                value={form.first}
                onChange={handleChange("first")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Last name</label>
              <input
                className="w-full rounded-2xl border px-4 py-2"
                value={form.last}
                onChange={handleChange("last")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <input
                type="email"
                className="w-full rounded-2xl border px-4 py-2"
                value={form.email}
                onChange={handleChange("email")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Phone (optional)</label>
              <input
                className="w-full rounded-2xl border px-4 py-2"
                value={form.phone}
                onChange={handleChange("phone")}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Interest area</label>
            <input
              className="w-full rounded-2xl border px-4 py-2"
              placeholder="Clinic outreach, logistics, admin…"
              value={form.interest}
              onChange={handleChange("interest")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Message (optional)</label>
            <textarea
              className="min-h-[100px] w-full rounded-2xl border px-4 py-2"
              value={form.message}
              onChange={handleChange("message")}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {ok && (
            <div className="rounded-2xl border bg-green-50 p-4 text-sm">
              <p className="font-medium">Thank you! ✅</p>
              <p className="opacity-80">
                We’ve received your application and emailed you a confirmation.
              </p>
            </div>
          )}

          <Button
  type="button"
  onClick={() => {
    window.location.href =
      "https://cms.humblevesselfoundationandclinic.org/volunteer-application/";
  }}
>
  Start application
</Button>
        </form>
      </Section>
    </main>
  );
}
