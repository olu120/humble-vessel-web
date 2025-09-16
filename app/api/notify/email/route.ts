import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { donorName, donorEmail, amount, currency, reference, instructions } = await req.json();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;

  const drawText = (text: string, options: { bold?: boolean; size?: number; color?: any } = {}) => {
    const { bold = false, size = 12, color = rgb(0, 0, 0) } = options;
    const lines = text.split("\n");
    for (const ln of lines) {
      page.drawText(ln, {
        x: 60,
        y,
        size,
        font: bold ? fontBold : fontRegular,
        color,
      });
      y -= size + 6;
    }
    y -= 4;
  };

  // Header
  drawText("Humble Vessel Foundation & Clinic", { bold: true, size: 18, color: rgb(0, 0.47, 0.71) });
  drawText("Trusted Healthcare. Community Driven.", { size: 12, color: rgb(0.13, 0.58, 0.32) });
  y -= 20;

  // Donor info
  if (donorName) drawText(`Donor: ${donorName}`);
  if (donorEmail) drawText(`Email: ${donorEmail}`);
  drawText(`Donation: ${currency} ${amount}`);
  drawText(`Reference: ${reference}`, { bold: true });
  y -= 10;

  // Divider
  page.drawLine({ start: { x: 60, y }, end: { x: 535, y }, thickness: 1, color: rgb(0, 0.47, 0.71) });
  y -= 30;

  // Bank Instructions
  drawText("Bank Transfer (SWIFT) Instructions", { bold: true, size: 14, color: rgb(0, 0.47, 0.71) });
  drawText(instructions);

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="HumbleVessel_SWIFT_${reference}.pdf"`,
    },
  });
}
