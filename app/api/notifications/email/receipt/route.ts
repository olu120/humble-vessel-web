// app/api/notifications/email/receipt/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { tplLocalAirtel /*, tplSwift */ } from "@/lib/email-templates";

/**
 * POST body:
 * {
 *   type: "local" | "swift",
 *   to: "donor@example.com",
 *   donorName?: string,
 *   amount: number,
 *   currency: string,
 *   reference: string,
 *   // local:
 *   merchantCode?: string
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, to, donorName, amount, currency, reference } = body;

    if (!type || !to || !amount || !currency || !reference) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // ✅ SWIFT receipts are now handled *only* by /api/payments/swift/email
    // We short-circuit here to avoid sending a second (broken) email.
    if (type === "swift") {
      return NextResponse.json({
        ok: true,
        skipped: "swift handled by /api/payments/swift/email",
      });
    }

    // ---- Local (Airtel / Mobile Money) receipt ----
    if (type === "local") {
      const merchantCode = body.merchantCode || "6890724";

      await sendMail({
        to,
        subject: `Your Airtel Merchant Instructions – Ref ${reference}`,
        html: tplLocalAirtel({
          donorName,
          amount,
          currency,
          reference,
          merchantCode,
        }),
      });

      return NextResponse.json({ ok: true });
    }

    // Fallback for unknown type
    return NextResponse.json(
      { ok: false, error: `Unsupported receipt type: ${type}` },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
