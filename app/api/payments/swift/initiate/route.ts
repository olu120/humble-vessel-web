import { NextResponse } from "next/server";
import { createDonationIntent, updateDonationIntent } from "@/lib/wp-intents";

export async function POST(req: Request) {
  try {
    const { amount, currency } = await req.json();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "";

    const ref = `${process.env.SWIFT_REFERENCE_PREFIX || "HV-"}${Date.now()}`;
    const instructions = `
Bank Name: ${process.env.SWIFT_BANK_NAME || "<Your Bank>"}
Bank Address: ${process.env.SWIFT_BANK_ADDRESS || "<Bank Address>"}
SWIFT/BIC: ${process.env.SWIFT_SWIFT_BIC || "<SWIFT/BIC>"}

Beneficiary: ${process.env.SWIFT_BENEFICIARY_NAME || "<Beneficiary Name>"}
Beneficiary Address: ${process.env.SWIFT_BENEFICIARY_ADDRESS || "<Beneficiary Address>"}
Account Number: ${process.env.SWIFT_ACCOUNT_NUMBER || "<Account Number>"}

Amount: ${currency || "USD"} ${amount}
Payment Reference: ${ref}

Please include the Payment Reference exactly as shown to help us reconcile your donation.
`.trim();

    // 1) Create intent (issued_instructions)
    const intent = await createDonationIntent({
      amount: Number(amount),
      currency: currency || "USD",
      method: "swift",
      status: "issued_instructions",
      reference: ref,
      client_ip: ip,
    });

    // Optionally: if critical fields are missing, flag in notes
    const missing = ["SWIFT_BANK_NAME","SWIFT_BANK_ADDRESS","SWIFT_BENEFICIARY_NAME","SWIFT_ACCOUNT_NUMBER","SWIFT_SWIFT_BIC"]
      .filter(k => !process.env[k as keyof NodeJS.ProcessEnv]);
    if (missing.length) {
      await updateDonationIntent(intent.id, { notes: `Missing: ${missing.join(", ")}` });
    }

    return NextResponse.json({ ok: missing.length === 0, instructions, reference: ref });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
