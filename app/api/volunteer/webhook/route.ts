// app/api/volunteer/webhook/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ——— helper: tolerant JSON/body reader ———
async function readBody(req: Request): Promise<any> {
  const ct = req.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) return await req.json();
    const text = await req.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function toFlat(payload: any): Record<string, any> {
  // forminator -> { data: { first_name: ..., ... } }  OR  { fields: [{name,value}, ...] }
  if (payload?.data && typeof payload.data === 'object') return payload.data;
  if (Array.isArray(payload?.fields)) {
    const o: Record<string, any> = {};
    for (const f of payload.fields) if (f?.name) o[f.name] = f.value;
    return o;
  }
  return payload && typeof payload === 'object' ? payload : {};
}

// ——— allow Forminator test pings ———
export async function GET() {
  // Return 200 so the “Set Up Webhook” modal succeeds.
  return NextResponse.json({ ok: true, method: 'GET' }, { status: 200 });
}
export async function HEAD() {
  return new Response(null, { status: 200 });
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,HEAD,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Secret',
    },
  });
}

// ——— real submission ———
export async function POST(req: Request) {
  try {
    // Optional: protect with a secret, but DO NOT block GET/HEAD above.
    const required = (process.env.VOLUNTEER_WEBHOOK_SECRET || '').trim();
    if (required) {
      const url = new URL(req.url);
      const s = req.headers.get('x-webhook-secret') || url.searchParams.get('secret') || '';
      if (s !== required) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const payload = await readBody(req);
    const f = toFlat(payload);

    const first = f.first_name || f.firstname || '';
    const last  = f.last_name  || f.lastname  || '';
    const email = f.email || '';
    const phone = f.phone || '';
    const interest = f.interest_area || f.interestarea || f.interestedarea || '';
    const message = f.message || f.notes || '';

    // Optional email to your inbox (uses existing SMTP env)
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT || 587);
    const to   = process.env.FROM_EMAIL || 'info@humblevesselfoundationandclinic.org';
    const from = `${process.env.FROM_NAME || 'Humble Vessel Foundation & Clinic'} <${to}>`;

    if (host && user && pass) {
      const tx = nodemailer.createTransport({ host, port, auth: { user, pass } });
      await tx.sendMail({
        from,
        to,
        replyTo: email || undefined,
        subject: `New Volunteer Application — ${first} ${last}`,
        text:
`Name: ${first} ${last}
Email: ${email}
Phone: ${phone}
Interest: ${interest}

Message:
${message || '-'}
`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
