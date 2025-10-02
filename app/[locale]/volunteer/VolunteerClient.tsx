"use client";
import { useState } from "react";
import Section from "@/components/Section";
import Button from "@/components/Button";

export default function VolunteerClient({ locale }: { locale: "en" | "lg" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState<"" | "medical" | "community" | "admin">("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = {
    title: locale === "lg" ? "Weyambise" : "Volunteer",
    subtitle:
      locale === "lg"
        ? "Yingira mu mulimu oguyamba mu by’obulamu n’obwenkanya."
        : "Join our work supporting healthcare and justice.",
    name: locale === "lg" ? "Erinnya lyo" : "Your name",
    email: "Email",
    area: locale === "lg" ? "Ekifo ky'okweyambisa" : "Area of interest",
    placeholder:
      locale === "lg" ? "Londa ekifo" : "Select an area",
    medical: locale === "lg" ? "Eby’obulamu" : "Medical",
    community: locale === "lg" ? "Kwekalakaasa/Obwanakyewa" : "Community outreach",
    admin: locale === "lg" ? "Ofiisi/Okutegeka" : "Admin/Operations",
    note: locale === "lg" ? "Obubaka obutono (si bwetaavu)" : "Short note (optional)",
    send: locale === "lg" ? "Wereza" : "Send",
    thanks:
      locale === "lg"
        ? "Webale nnyo! Tulikukubira ku email olw’okuddamu."
        : "Thank you! We’ll follow up by email.",
  };

  async function submit() {
    if (loading || !name || !email || !area) return;
    setLoading(true);
    try {
      // Simple POST to a placeholder route you can wire later
      await fetch("/api/volunteer/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, area, msg, locale }),
      });
      setSent(true);
    } catch {
      // Non-blocking: keep UI simple for now
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Section title={t.title} subtitle={t.subtitle}>
        {!sent ? (
          <div className="max-w-xl p-6 border rounded-2xl space-y-4">
            <div>
              <label className="block mb-1 text-sm">{t.name}</label>
              <input
                className="w-full px-4 py-2 border rounded-2xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={locale === "lg" ? "Erinnya lyo" : "Full name"}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">{t.email}</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-2xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">{t.area}</label>
              <select
                className="w-full px-4 py-2 border rounded-2xl bg-white"
                value={area}
                onChange={(e) => setArea(e.target.value as any)}
              >
                <option value="">{t.placeholder}</option>
                <option value="medical">{t.medical}</option>
                <option value="community">{t.community}</option>
                <option value="admin">{t.admin}</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">{t.note}</label>
              <textarea
                className="w-full px-4 py-2 border rounded-2xl min-h-[100px]"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={locale === "lg" ? "Obubaka obufupi..." : "A short note..."}
              />
            </div>
            <Button onClick={submit} disabled={loading || !name || !email || !area}>
              {loading ? (locale === "lg" ? "Okuweereza…" : "Sending…") : t.send}
            </Button>
          </div>
        ) : (
          <div className="max-w-xl p-6 border rounded-2xl bg-green-50">
            <p>{t.thanks}</p>
          </div>
        )}
      </Section>
    </main>
  );
}
