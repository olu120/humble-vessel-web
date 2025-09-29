export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { merchantCode = "6890724", amount = 0, currency = "UGX", reference = "" } = await req.json();

    const website  = process.env.ORG_WEBSITE  || "https://humblevesselfoundationandclinic.org";
    const whatsapp = process.env.ORG_WHATSAPP || "+256 774 381 886";

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const brandBlue  = rgb(0 / 255, 90 / 255, 140 / 255);
    const brandGreen = rgb(0 / 255, 112 / 255, 60 / 255);
    const grayText   = rgb(0.2, 0.2, 0.2);

    // try to embed logo
    try {
      const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
      const logoBytes = fs.readFileSync(logoPath);
      const logo = await pdfDoc.embedPng(logoBytes);
      const scale = 0.22;
      page.drawImage(logo, {
        x: 60,
        y: height - 95,
        width: logo.width * scale,
        height: logo.height * scale,
      });
    } catch {}

    let y = height - 120;

    const drawText = (text: string, opts: { bold?: boolean; size?: number; color?: any } = {}) => {
      const { bold = false, size = 12, color = rgb(0, 0, 0) } = opts;
      const lines = (text || "").split("\n");
      for (const line of lines) {
        page.drawText(line, { x: 60, y, size, font: bold ? fontBold : fontRegular, color });
        y -= size + 6;
      }
      y -= 2;
    };

    // Header
    drawText("Humble Vessel Foundation & Clinic", { bold: true, size: 18, color: brandBlue });
    drawText("Airtel Money — Merchant Payment Instructions", { size: 12, color: brandGreen });
    y -= 10;

    // Divider
    page.drawLine({ start: { x: 60, y }, end: { x: width - 60, y }, thickness: 1.2, color: brandBlue });
    y -= 24;

    // Summary
    drawText(`Merchant Code: ${merchantCode}`, { bold: true, size: 13 });
    drawText(`Amount: ${currency} ${Number(amount || 0).toLocaleString()}`);
    drawText(`Payment Reference (enter exactly): ${reference}`, { bold: true });
    y -= 8;

    // Divider
    page.drawLine({ start: { x: 60, y }, end: { x: width - 60, y }, thickness: 0.8, color: brandBlue });
    y -= 20;

    // Steps
    drawText("How to pay with Airtel Money:", { bold: true, size: 14, color: brandBlue });
    drawText("1) On your Airtel line, dial *185#");
    drawText("2) Choose Pay Bill / Merchant");
    drawText(`3) Enter Merchant Code: ${merchantCode}`);
    drawText(`4) Enter Amount: ${currency} ${Number(amount || 0).toLocaleString()}`);
    drawText(`5) Enter Payment Reference: ${reference}`);
    drawText("6) Confirm and complete the payment on your phone.");
    y -= 6;

    drawText("Tip: Keep your transaction SMS/receipt for your records.", { size: 10, color: grayText });
    y -= 16;

    // Footer
    const footerH = 40;
    const footerY = 30;
    page.drawLine({
      start: { x: 60, y: footerY + footerH },
      end:   { x: width - 60, y: footerY + footerH },
      thickness: 0.7,
      color: brandBlue,
    });

    const fs10 = 10;
    page.drawText(website, { x: 60, y: footerY + 12, size: fs10, font: fontRegular, color: grayText });
    const rightText = `WhatsApp: ${whatsapp}`;
    const tw = fontRegular.widthOfTextAtSize(rightText, fs10);
    page.drawText(rightText, { x: width - 60 - tw, y: footerY + 12, size: fs10, font: fontRegular, color: grayText });

    const bytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="HumbleVessel_Airtel_${reference || "instructions"}.pdf"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to generate PDF" }, { status: 500 });
  }
}
