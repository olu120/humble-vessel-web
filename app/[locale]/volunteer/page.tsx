"use client";

import React, { useRef, useState } from "react";
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
  const formRef = useRef<HTMLFormElement | null>(null);

  const [form, setForm] = useState<FormState>({
    first: "",
    last: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.first || !form.last || !form.email) {
      setErr("Please fill in first name, last name and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/volunteer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(data?.error || "Failed to submit");
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
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* Hero / intro section */}
      <Section
        title="Volunteer with Humble Vessel"
        subtitle="Join our mission to deliver trusted, community-centered healthcare."
      >
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] items-start">
          {/* Left – copy */}
          <div className="space-y-6">
            <p className="text-sm md:text-base leading-relaxed opacity-90">
              Volunteers help us reach more families with safe, affordable
              healthcare and community outreach. Whether you’re a clinician,
              student, or simply passionate about serving, there is a place for
              you at Humble Vessel.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border p-4 bg-white">
                <h3 className="font-semibold mb-1 text-sm md:text-base">
                  Clinical & outreach support
                </h3>
                <p className="text-xs md:text-sm opacity-80">
                  Assist with clinics, triage, health education, and community
                  screenings (where appropriate and supervised).
                </p>
              </div>
              <div className="rounded-2xl border p-4 bg-white">
                <h3 className="font-semibold mb-1 text-sm md:text-base">
                  Administration & communications
                </h3>
                <p className="text-xs md:text-sm opacity-80">
                  Help with data entry, documentation, media, and coordination
                  of programs and events.
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs md:text-sm opacity-90">
              <li>• Flexible opportunities — some roles are remote-friendly.</li>
              <li>• You’ll receive basic orientation and supervision.</li>
              <li>• We welcome both medical and non-medical volunteers.</li>
            </ul>

            <Button type="button" onClick={scrollToForm}>
              Start your application
            </Button>
          </div>

          {/* Right – “What we look for” / card */}
          <aside className="rounded-2xl border bg-brand-light/40 p-5 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-2">
              What we look for
            </h3>
            <ul className="space-y-2 text-xs md:text-sm opacity-90">
              <li>• A heart for serving communities in Uganda</li>
              <li>• Reliability and respect for patient confidentiality</li>
              <li>• Willingness to learn and work in a team</li>
              <li>• For clinical roles, relevant training and registration</li>
            </ul>
            <p className="mt-4 text-xs md:text-sm opacity-80">
              Fill in the form below and our team will contact you with next
              steps and current openings.
            </p>
          </aside>
        </div>
      </Section>

      {/* Form section */}
      <Section title="Volunteer application" subtitle="Tell us a bit about yourself.">
        {ok ? (
          <div className="p-4 border rounded-2xl bg-green-50 max-w-xl">
            <p className="font-medium">Thank you! ✅</p>
            <p className="text-sm opacity-80">
              We’ve received your application and logged it in our system. Our
              team will review and follow up by email.
            </p>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={submit}
            className="max-w-xl space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm">First name</label>
                <input
                  className="w-full px-4 py-2 border rounded-2xl"
                  value={form.first}
                  onChange={onChange("first")}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Last name</label>
                <input
                  className="w-full px-4 py-2 border rounded-2xl"
                  value={form.last}
                  onChange={onChange("last")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-2xl"
                  value={form.email}
                  onChange={onChange("email")}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Phone (optional)</label>
                <input
                  className="w-full px-4 py-2 border rounded-2xl"
                  value={form.phone}
                  onChange={onChange("phone")}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm">Interest area</label>
              <input
                className="w-full px-4 py-2 border rounded-2xl"
                placeholder="Clinical support, outreach, admin…"
                value={form.interest}
                onChange={onChange("interest")}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Message (optional)</label>
              <textarea
                className="w-full px-4 py-2 border rounded-2xl min-h-[100px]"
                value={form.message}
                onChange={onChange("message")}
              />
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        )}
      </Section>
    </main>
  );
}
