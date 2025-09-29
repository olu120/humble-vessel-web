const WEBSITE = process.env.ORG_WEBSITE || "https://humblevesselfoundationandclinic.org";
const WHATSAPP = process.env.NEXT_PUBLIC_ORG_WHATSAPP || "+256 774 381 886";

// Very simple brand header/footer. Keep CSS inline for client compatibility.
const base = {
  header: `
    <div style="padding:16px 0">
      <h2 style="margin:0;color:#005A8C;font-family:Arial,sans-serif">
        Humble Vessel Foundation & Clinic
      </h2>
      <p style="margin:2px 0 0;color:#1B7F4B;font-family:Arial,sans-serif;font-size:12px">
        Trusted Healthcare. Community Driven.
      </p>
    </div>
    <hr style="border:none;border-top:2px solid #005A8C;opacity:.7" />
  `,
  footer: `
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0 12px" />
    <p style="margin:0;color:#666;font-size:12px;font-family:Arial,sans-serif">
      Need help? WhatsApp: ${WHATSAPP} &nbsp;|&nbsp; <a href="${WEBSITE}">${WEBSITE}</a>
    </p>
  `,
};

export function tplLocalAirtel(args: {
  donorName?: string;
  amount: number;
  currency: string; // "UGX"
  reference: string;
  merchantCode: string; // "6890724"
}) {
  const { donorName, amount, currency, reference, merchantCode } = args;
  return `
  ${base.header}
  <div style="font-family:Arial,sans-serif;color:#111;font-size:14px;line-height:1.5">
    <p>Hello ${donorName ? donorName : "Donor"},</p>
    <p>Thank you for starting your donation to Humble Vessel. Please complete the payment with <b>Airtel Money</b> using the steps below.</p>

    <div style="background:#F0FFF4;border:1px solid #9AE6B4;border-radius:8px;padding:12px;margin:12px 0">
      <p style="margin:0 0 6px 0"><b>Summary</b></p>
      <p style="margin:0">Amount: <b>${currency} ${Number(amount||0).toLocaleString()}</b></p>
      <p style="margin:0">Reference: <b>${reference}</b> (enter exactly)</p>
    </div>

    <p style="margin:16px 0 6px 0;"><b>How to pay with Airtel Money:</b></p>
    <ol style="margin:0 0 12px 18px;padding:0">
      <li>Dial <b>*185#</b> on your Airtel line</li>
      <li>Choose <b>Pay Bill / Merchant</b></li>
      <li>Enter Merchant Code: <b>${merchantCode}</b></li>
      <li>Enter Amount: <b>${currency} ${Number(amount||0).toLocaleString()}</b></li>
      <li>Enter Payment Reference: <b>${reference}</b></li>
      <li>Confirm and complete the payment on your phone</li>
    </ol>

    <p style="color:#666;font-size:12px">Tip: Please keep your transaction SMS/receipt for your records.</p>
    <p style="margin-top:16px">With gratitude,<br/>Humble Vessel</p>
  </div>
  ${base.footer}
  `;
}

export function tplSwift(args: {
  donorName?: string;
  amount: number;
  currency: string; // send currency
  reference: string;
}) {
  const { donorName, amount, currency, reference } = args;
  return `
  ${base.header}
  <div style="font-family:Arial,sans-serif;color:#111;font-size:14px;line-height:1.5">
    <p>Hello ${donorName ? donorName : "Donor"},</p>
    <p>Thank you for your donation to Humble Vessel. We’ve attached a PDF with your SWIFT bank transfer instructions.</p>

    <div style="background:#F0F7FF;border:1px solid #9DC4F8;border-radius:8px;padding:12px;margin:12px 0">
      <p style="margin:0 0 6px 0"><b>Summary</b></p>
      <p style="margin:0">Amount: <b>${currency} ${Number(amount||0).toLocaleString()}</b></p>
      <p style="margin:0">Reference: <b>${reference}</b></p>
      <p style="margin:0;color:#333;font-size:12px">Note: The receiving bank credits in UGX and charges a flat USD 100 receiving fee.</p>
    </div>

    <p>Please include the reference exactly as shown when making your transfer.</p>
    <p style="margin-top:16px">With gratitude,<br/>Humble Vessel</p>
  </div>
  ${base.footer}
  `;
}
