// app/api/payments/swift/pdf/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      donorName,
      amount,
      currency,
      reference,
      feeUSD,
      receiveCurrency,
    } = body;

    const sendCur = (currency || "USD").toUpperCase();
    const recvCur = (receiveCurrency || process.env.SWIFT_RECEIVE_CURRENCY || "UGX").toUpperCase();
    const fee = typeof feeUSD === "number" ? feeUSD : Number(process.env.SWIFT_FIXED_FEE_USD || 50);

    const bankName = process.env.SWIFT_BANK_NAME || "<Bank Name>";
    const bankAddress = process.env.SWIFT_BANK_ADDRESS || "<Bank Address>";
    const swiftBic = process.env.SWIFT_SWIFT_BIC || "<SWIFT/BIC>";
    const accountNo = process.env.SWIFT_ACCOUNT_NUMBER || "<Account Number>";
    const benName = process.env.SWIFT_BENEFICIARY_NAME || "<Beneficiary Name>";
    const benAddress = process.env.SWIFT_BENEFICIARY_ADDRESS || "<Beneficiary Address>";

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 portrait
    const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    const marginX = 60;
    const lineHeight = 16;

    const drawHeading = (text: string) => {
      page.drawText(text, {
        x: marginX,
        y,
        size: 18,
        font: helvBold,
        color: rgb(0, 0.4, 0.7),
      });
      y -= 26;
    };

    const drawLabel = (label: string, value: string) => {
      page.drawText(label, {
        x: marginX,
        y,
        size: 11,
        font: helvBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(value, {
        x: marginX + 140,
        y,
        size: 11,
        font: helv,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    };

    const drawParagraph = (text: string) => {
      const words = text.split(" ");
      let line = "";
      const maxWidth = 475;

      for (const w of words) {
        const trial = line ? line + " " + w : w;
        const width = helv.widthOfTextAtSize(trial, 11);
        if (width > maxWidth) {
          page.drawText(line, {
            x: marginX,
            y,
            size: 11,
            font: helv,
            color: rgb(0.1, 0.1, 0.1),
          });
          y -= lineHeight;
          line = w;
        } else {
          line = trial;
        }
      }
      if (line) {
        page.drawText(line, {
          x: marginX,
          y,
          size: 11,
          font: helv,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineHeight;
      }
      y -= 6;
    };

    // Header
    page.drawText("Humble Vessel Foundation & Clinic", {
      x: marginX,
      y,
      size: 20,
      font: helvBold,
      color: rgb(0, 0.4, 0.7),
    });
    y -= 28;
    page.drawText("SWIFT Transfer Instructions", {
      x: marginX,
      y,
      size: 13,
      font: helv,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 30;

    // Donor + reference
    drawHeading("Your Details");
    if (donorName) {
      drawLabel("Donor name:", donorName);
    }
    drawLabel("Amount:", `${sendCur} ${amount}`);
    drawLabel("Receiving currency:", recvCur);
    drawLabel("Payment reference:", reference);
    y -= 16;

    // Bank account section
    drawHeading("Account to Receive Your Donation");
    drawLabel("Beneficiary:", benName);
    drawLabel("Address:", benAddress);
    y -= 10;

    drawLabel("Bank:", bankName);
    drawLabel("Bank address:", bankAddress);
    drawLabel("SWIFT/BIC:", swiftBic);
    drawLabel("Account number:", accountNo);
    y -= 20;

    // What to tell your bank
    drawHeading("Instructions for Your Bank");
    drawParagraph(
      "1. You can send your donation from any major currency (for example USD, EUR, GBP, etc.). Your bank will send in your local currency and our account will receive the funds in " +
        recvCur +
        "."
    );
    drawParagraph(
      "2. Please give your bank the Payment Reference above and ask them to include it exactly in the SWIFT transfer details."
    );
    drawParagraph(
      `3. The receiving bank may deduct a fixed fee of about USD ${fee.toFixed(
        0
      )} before the funds reach the clinic.`
    );
    drawParagraph(
      "4. If the bank asks for an invoice or proof, you may show them this page as the official donation instructions."
    );

    y -= 10;
    page.drawText("Thank you for supporting Humble Vessel Foundation & Clinic.", {
      x: marginX,
      y,
      size: 11,
      font: helvBold,
      color: rgb(0, 0.4, 0.2),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=HV_SWIFT_${reference}.pdf`,
      },
    });
  } catch (e: any) {
    return new NextResponse(`Failed to generate PDF: ${e?.message || e}`, {
      status: 500,
    });
  }
}
