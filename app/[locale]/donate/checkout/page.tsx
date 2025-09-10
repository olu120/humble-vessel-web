"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Section from "@/components/Section";
import Button from "@/components/Button";

export default function DonateCheckout() {
  const sp = useSearchParams();
  const tab = (sp.get("tab") as "local"|"intl") || "local";
  const amount = Number(sp.get("amount") || 0);
  const locale = (typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "en");

  // Local Mobile Money data
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState<"mtn"|"airtel"|"">("");

  const proceed = async () => {
    if (tab === "local") {
      if (!phone || !network) return alert("Enter phone and choose network.");
      const res = await fetch("/api/payments/mobile-money/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "UGX", phone, network })
      });
      const data = await res.json();
      if (data?.ok) window.location.href = `/${locale}/donate/donate-success`;
      else window.location.href = `/${locale}/donate/donate-cancel`;
      return;
    }

    // International: show SWIFT instructions
    const res = await fetch("/api/payments/swift/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "USD" })
    });
    const data = await res.json();

    if (data?.instructions) {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<pre style="white-space:pre-wrap;font-family:system-ui">${data.instructions}</pre>`);
        w.document.title = "Bank Transfer (SWIFT) Instructions";
      }
      window.location.href = `/${locale}/donate/donate-success`;
    } else {
      alert("SWIFT details not configured yet. Please try later.");
      window.location.href = `/${locale}/donate/donate-cancel`;
    }
  };

  return (
    <main>
      <Section title="Confirm your donation">
        <div className="rounded-2xl border p-6 max-w-xl">
          <div className="mb-4">
            <p className="text-sm opacity-80">Donation type</p>
            <p className="text-lg font-medium">{tab === "intl" ? "International (USD)" : "Local (UGX)"}</p>
          </div>
          <div className="mb-6">
            <p className="text-sm opacity-80">Amount</p>
            <p className="text-2xl font-semibold">
              {tab === "intl" ? `$${amount}` : `UGX ${amount.toLocaleString()}`}
            </p>
          </div>

          {tab === "local" && (
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm mb-1">Phone number</label>
                <input className="w-full rounded-2xl border px-4 py-2"
                  placeholder="2567XXXXXXXX"
                  value={phone} onChange={(e)=>setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Network</label>
                <div className="flex gap-3">
                  <button className={`px-3 py-2 rounded-2xl border ${network==="mtn"?"border-brand-blue ring-2 ring-brand-blue/20":""}`}
                    onClick={()=>setNetwork("mtn")}>MTN</button>
                  <button className={`px-3 py-2 rounded-2xl border ${network==="airtel"?"border-brand-blue ring-2 ring-brand-blue/20":""}`}
                    onClick={()=>setNetwork("airtel")}>Airtel</button>
                </div>
              </div>
            </div>
          )}

          <Button onClick={proceed}>Proceed</Button>
        </div>
      </Section>
    </main>
  );
}
