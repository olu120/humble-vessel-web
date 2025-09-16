export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const {
    donorName,
    donorEmail,
    amount,
    currency,
    reference,
    instructions,
    feeUSD,
    receiveCurrency,
  } = await req.json();

  const website =
    process.env.ORG_WEBSITE || "https://humblevesselfoundationandclinic.org";
  const whatsapp = process.env.ORG_WHATSAPP || "+256703969110";

  // Brand colors
  const BLUE = rgb(0, 0.47, 0.71);   // ~ #0077B6
  const GREEN = rgb(0.13, 0.58, 0.32); // ~ #219653
  const TEXT_MUTED = rgb(0.2, 0.2, 0.2);

  const pdf = await PDFDocument.create();

  // Page / layout constants
  const PAGE = { w: 595.28, h: 841.89 }; // A4
  const MARGIN_L = 60;
  const MARGIN_R = 60;

  const FOOTER_H = 40;
  const FOOTER_Y = 30;
  const CONTENT_BOTTOM = FOOTER_Y + FOOTER_H + 24; // safe bottom above footer

  // helpers to add a new page and draw footer
  const addPage = () => pdf.addPage([PAGE.w, PAGE.h]);
  let page = addPage();
  let y = PAGE.h - 120; // initial content Y

  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const drawFooter = (p: typeof page) => {
    // top border of footer
    p.drawLine({
      start: { x: MARGIN_L, y: FOOTER_Y + FOOTER_H },
      end: { x: PAGE.w - MARGIN_R, y: FOOTER_Y + FOOTER_H },
      thickness: 0.8,
      color: BLUE,
    });

    const size = 10;
    // left text
    p.drawText(website, {
      x: MARGIN_L,
      y: FOOTER_Y + 12,
      size,
      font: fontReg,
      color: TEXT_MUTED,
    });

    // right text (simple right align)
    const right = `WhatsApp: ${whatsapp}`;
    const tw = fontReg.widthOfTextAtSize(right, size);
    p.drawText(right, {
      x: PAGE.w - MARGIN_R - tw,
      y: FOOTER_Y + 12,
      size,
      font: fontReg,
      color: TEXT_MUTED,
    });
  };

  // Place footer on the first page immediately (and on every new page)
  drawFooter(page);

  // auto page-break if we're near the footer
  const ensureSpace = (min: number) => {
    if (y - min <= CONTENT_BOTTOM) {
      page = addPage();
      drawFooter(page);
      y = PAGE.h - 60; // top margin for subsequent pages
    }
  };

  // text wrapper with page-break awareness
  const drawParagraph = (
    text: string,
    opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; leading?: number } = {},
  ) => {
    const size = opts.size ?? 12;
    const leading = opts.leading ?? size + 6;
    const color = opts.color ?? rgb(0, 0, 0);
    const font = opts.bold ? fontBold : fontReg;
    const maxWidth = PAGE.w - (MARGIN_L + MARGIN_R);

    const words = (text || "").split(/\s+/);
    let line = "";

    const flushLine = (ln: string) => {
      ensureSpace(leading);
      page.drawText(ln, { x: MARGIN_L, y, size, font, color });
      y -= leading;
    };

    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w;
      const width = font.widthOfTextAtSize(candidate, size);
      if (width > maxWidth) {
        if (line) flushLine(line);
        // very long single word fallback
        if (font.widthOfTextAtSize(w, size) > maxWidth) {
          let chunk = "";
          for (const ch of w) {
            const test = chunk + ch;
            if (font.widthOfTextAtSize(test, size) > maxWidth) {
              flushLine(chunk);
              chunk = ch;
            } else {
              chunk = test;
            }
          }
          if (chunk) line = chunk;
          else line = "";
        } else {
          line = w;
        }
      } else {
        line = candidate;
      }
    }
    if (line) flushLine(line);

    // small paragraph spacing
    y -= 4;
  };

  const drawHeading = (text: string) => {
    drawParagraph(text, { bold: true, size: 14, color: BLUE, leading: 18 });
  };

  const drawDivider = (thickness = 1.2, color = BLUE) => {
    ensureSpace(18);
    page.drawLine({
      start: { x: MARGIN_L, y },
      end: { x: PAGE.w - MARGIN_R, y },
      thickness,
      color,
    });
    y -= 24;
  };

  // --- Logo (PNG) ---
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    const bytes = fs.readFileSync(logoPath);
    const img = await pdf.embedPng(bytes);

    const targetH = 64;
    const scale = targetH / img.height;

    page.drawImage(img, {
      x: MARGIN_L,
      y: PAGE.h - 60 - targetH,
      width: img.width * scale,
      height: img.height * scale,
    });
  } catch {
    // ignore missing logo
  }

  // --- Header
  drawParagraph("Humble Vessel Foundation & Clinic", {
    bold: true,
    size: 18,
    color: BLUE,
    leading: 22,
  });
  drawParagraph("Trusted Healthcare. Community Driven.", {
    size: 12,
    color: GREEN,
  });
  y -= 12;

  // --- Donor info
  if (donorName) drawParagraph(`Donor: ${donorName}`);
  if (donorEmail) drawParagraph(`Email: ${donorEmail}`);
  drawParagraph(`Donation: ${currency} ${Number(amount || 0).toLocaleString()}`);
  drawParagraph(`Reference: ${reference}`, { bold: true });
  y -= 6;

  drawDivider(1.2, BLUE);

  // --- Fees & Conversion
  drawHeading("Fees & Conversion");
  drawParagraph(`Send Currency: ${currency || "USD"}`);
  drawParagraph(
    `Receiving Currency: ${receiveCurrency || "UGX"} (bank FX rate applies)`,
  );
  if (typeof feeUSD === "number") {
    drawParagraph(`Fixed Receiving Bank Fee: USD ${feeUSD}`);
  }

  drawDivider(0.8, BLUE);

  // --- Instructions
  drawHeading("Bank Transfer (SWIFT) Instructions");
  // instructions may be multi-line; split by \n and draw each part with wrapping
  String(instructions || "")
    .split(/\r?\n/)
    .forEach((line) => drawParagraph(line));

  // (footer already drawn; our layout keeps a safe bottom margin)

  const bytesOut = await pdf.save();
  return new NextResponse(Buffer.from(bytesOut), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="HumbleVessel_SWIFT_${reference}.pdf"`,
    },
  });
}
