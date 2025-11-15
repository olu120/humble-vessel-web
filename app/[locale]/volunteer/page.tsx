// app/[locale]/volunteer/page.jsx
'use client';

import { useRef, useState } from 'react';
import Section from '@/components/Section';
import Button from '@/components/Button';

export default function VolunteerPage() {
  const formRef = useRef(null);
  const [first, setFirst] = useState('');
  const [last, setLast]   = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('');
  const [message, setMessage] = useState('');

  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const scrollToForm = () => {
    if (formRef.current && typeof formRef.current.scrollIntoView === 'function') {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  async function submit(e) {
    e.preventDefault();
    setErr(null);

    if (!first || !last || !email) {
      setErr('Please fill in first name, last name and email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/volunteer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: first,
          last_name:  last,
          email,
          phone,
          interest_area: interest,
          message
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Submission failed (${res.status})`);
      }

      setOk(true);
      setFirst(''); setLast(''); setEmail('');
      setPhone(''); setInterest(''); setMessage('');
    } catch (e2) {
      setErr(e2?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Section
        title="Volunteer with Us"
        subtitle="Join our mission to bring compassionate care to communities in Uganda."
      >
        <Button onClick={scrollToForm}>Start Application</Button>

        {/* How it works */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { n: '1. Apply',    d: 'Submit your details and preferred role.' },
            { n: '2. Review',   d: 'Our team reviews applications and contacts shortlisted candidates.' },
            { n: '3. Onboard',  d: 'Attend orientation and begin your volunteer journey.' }
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="font-semibold">{s.n}</p>
              <p className="mt-1 text-sm opacity-80">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Open roles */}
        <div className="mt-12">
          <h3 className="mb-4 text-lg font-semibold">Open Roles</h3>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Medical Volunteer', 'Support clinics and patient care.'],
              ['Outreach Coordinator', 'Lead health education in the community.'],
              ['Logistics Support', 'Assist with transport and supplies.']
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="font-medium">{t}</p>
                <p className="mt-1 text-sm opacity-80">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility / Requirements */}
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold">Eligibility</h3>
            <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
              <li>18 years or older</li>
              <li>Passion for community service</li>
              <li>Relevant experience preferred</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">Requirements</h3>
            <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
              <li>Valid ID and references</li>
              <li>Availability for scheduled clinics</li>
              <li>Adherence to safety protocols</li>
            </ul>
          </div>
        </div>

        {/* Application Form */}
        <div ref={formRef} className="mt-16">
          <h3 className="mb-2 text-xl font-semibold">Application Form</h3>
          <p className="mb-6 text-sm opacity-80">
            Share your details and preferences. We’ll get back to you.
          </p>

          {ok ? (
            <div className="rounded-2xl border bg-green-50 p-4">
              <p className="font-medium">Thank you! ✅</p>
              <p className="text-sm opacity-80">
                We’ve received your application and emailed you a confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="max-w-[900px] space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">First name</label>
                  <input className="w-full rounded-2xl border px-4 py-2"
                         value={first} onChange={(e)=>setFirst(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Last name</label>
                  <input className="w-full rounded-2xl border px-4 py-2"
                         value={last} onChange={(e)=>setLast(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Email</label>
                  <input type="email" className="w-full rounded-2xl border px-4 py-2"
                         value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Phone (optional)</label>
                  <input className="w-full rounded-2xl border px-4 py-2"
                         value={phone} onChange={(e)=>setPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm">Interest area</label>
                <input className="w-full rounded-2xl border px-4 py-2"
                       placeholder="Clinic Outreach, Medical, Logistics, Admin…"
                       value={interest} onChange={(e)=>setInterest(e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm">Message (optional)</label>
                <textarea className="min-h-[120px] w-full rounded-2xl border px-4 py-2"
                          value={message} onChange={(e)=>setMessage(e.target.value)} />
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit application'}
              </Button>
            </form>
          )}
        </div>
      </Section>
    </main>
  );
}
