import nodemailer from "nodemailer";

export type SendMailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer }[];
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text, attachments }: SendMailArgs) {
  const fromName = process.env.FROM_NAME || "Humble Vessel Foundation & Clinic";
  const fromEmail = process.env.FROM_EMAIL || "no-reply@humblevessel.org";

  const t = getTransporter();
  await t.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    text,
    attachments,
  });
}
