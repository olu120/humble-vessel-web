// app/api/volunteer/apply/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const {
      first_name = '',
      last_name  = '',
      email      = '',
      phone      = '',
      interest_area = '',
      message = ''
    } = body || {};

    // -------- email via SMTP (uses your .env)
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to   = process.env.FROM_EMAIL || 'info@humblevesselfoundationandclinic.org';
    const from = `${process.env.FROM_NAME || 'Humble Vessel'} <${to}>`;

    if (host && user && pass) {
      const tx = nodemailer.createTransport({ host, port, auth: { user, pass }});
      await tx.sendMail({
        from,
        to,
        subject: `New Volunteer Application — ${first_name} ${last_name}`,
        text:
`Name: ${first_name} ${last_name}
Email: ${email}
Phone: ${phone}
Interest: ${interest_area}

Message:
${message || '-'}
`,
      });
    }

    // In the future we can also append to Google Sheets here if you like.

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
