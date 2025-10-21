"use client";

import { useState } from "react";
import Section from "@/components/Section";
import Button from "@/components/Button";

export default function VolunteerPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!first || !last || !email) {
      setErr("Please fill in first name, last name and email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/volunteer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first, last, email, phone, interest, message }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");

      setOk(true);
      setFirst(""); setLast(""); setEmail(""); setPhone(""); setInterest(""); setMessage("");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Section title="Volunteer" subtitle="Join our mission to deliver trusted, community-centered healthcare.">
        {ok ? (
          <div className="p-4 border rounded-2xl bg-green-50">
            <p className="font-medium">Thank you! ✅</p>
            <p className="text-sm opacity-80">We’ve received your application and emailed you a confirmation.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="max-w-xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm">First name</label>
                <input className="w-full px-4 py-2 border rounded-2xl" value={first} onChange={e=>setFirst(e.target.value)} />
              </div>
              <div>
                <label className="block mb-1 text-sm">Last name</label>
                <input className="w-full px-4 py-2 border rounded-2xl" value={last} onChange={e=>setLast(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm">Email</label>
                <input type="email" className="w-full px-4 py-2 border rounded-2xl" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block mb-1 text-sm">Phone (optional)</label>
                <input className="w-full px-4 py-2 border rounded-2xl" value={phone} onChange={e=>setPhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm">Interest area</label>
              <input className="w-full px-4 py-2 border rounded-2xl" placeholder="Clinical support, outreach, admin…" value={interest} onChange={e=>setInterest(e.target.value)} />
            </div>

            <div>
              <label className="block mb-1 text-sm">Message (optional)</label>
              <textarea className="w-full px-4 py-2 border rounded-2xl min-h-[100px]" value={message} onChange={e=>setMessage(e.target.value)} />
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
