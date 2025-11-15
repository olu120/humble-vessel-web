import Section from "@/components/Section";
import Button from "@/components/Button";
import React from "react";

// Small stat card (server component)
function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-card">
      <p className="text-sm opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs opacity-60">{hint}</p> : null}
    </div>
  );
}

export default async function TransparencyPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale === "lg" ? "lg" : "en";

  const t =
    locale === "lg"
      ? {
          title: "Obwenkanya n’Emivuzo",
          intro:
            "Wano we tufulumiza enfunda y’ensimbi ezituukayo n’engeri gye zikoleddwa mu mirimu gya ddwaaliro n’eggwanga.",
          statsTitle: "Ebimu ku birooto byaffe (eby’okulabirako)",
          s1: { label: "Obuwumbi ku mirimu egy’obulamu", value: "82%", hint: "Okuwa obujjanjabi, eddagala, n’okusomesa." },
          s2: { label: "Obuwumbi ku byokulambula/okufuga", value: "12%", hint: "Okutwala abakozi, ebitundu ebizito, n’ebikozesebwa." },
          s3: { label: "Ebisuubirwa eby’okuyamba abantu (mwezi guno)", value: "≈ 250", hint: "Ebikozesebwa: ebirwadde ebyangu n’obuweereza." },
          methodologyTitle: "Engeri gye tukubira lipooti",
          methodology:
            "Ebiwanika by’ensimbi bikwatiddwa mu sisitemu yaffe era tubyongerako okuzuula oba byiweza n’engeri gye byakoleddwa. Lipooti eno eya mu maaso eri eya kulaga ebya buli mwezi/omwaka.",
          downloadTitle: "Fulumya CSV (abalina olukusa lw’abaddukanya)",
          downloadDesc:
            "Bw’oba oyingidde mu lukusa lw’abakwata ensonga, osobola okwanula fayiro ya CSV okuva mu sisitemu.",
          downloadBtn: "Wanula CSV",
          help:
            "Okufuna olukusa, genda ku /admin/reconcile ne oyongeza ?token=TOKEN wo. Oluvannyuma, osobola okuwanula wano.",
        }
      : {
          title: "Transparency & Impact",
          intro:
            "We publish where donations go and what they achieve across our clinic and community programs.",
          statsTitle: "Snapshot stats (placeholders)",
          s1: { label: "Program spending", value: "82%", hint: "Direct care, medicines, outreach." },
          s2: { label: "Ops & admin", value: "12%", hint: "Transport, staff support, essential tools." },
          s3: { label: "People served this month (est.)", value: "≈ 250", hint: "Typical minor ailments & clinic services." },
          methodologyTitle: "How we report",
          methodology:
            "Income and expenses are recorded in our system, reconciled by finance, and summarized here. This page is a live overview; monthly & annual reports follow.",
          downloadTitle: "Export CSV (admin only)",
          downloadDesc:
            "If you have admin permissions, you can download a raw CSV from our reconcile system.",
          downloadBtn: "Download CSV",
          help:
            "To enable downloads, visit /admin/reconcile once with ?token=YOUR_TOKEN. Then return here to export.",
        };

  // Public page uses placeholders for now. Replace with real aggregates later if needed.
  return (
    <main>
      <Section title={t.title}>
        <p className="max-w-3xl opacity-85">{t.intro}</p>

        {/* Stats */}
        <h3 className="mt-8 mb-3 text-lg font-semibold">{t.statsTitle}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label={t.s1.label} value={t.s1.value} hint={t.s1.hint} />
          <StatCard label={t.s2.label} value={t.s2.value} hint={t.s2.hint} />
          <StatCard label={t.s3.label} value={t.s3.value} hint={t.s3.hint} />
        </div>

        {/* Methodology */}
        <h3 className="mt-10 mb-2 text-lg font-semibold">{t.methodologyTitle}</h3>
        <p className="max-w-3xl opacity-85">{t.methodology}</p>

        {/* CSV export (admin) */}
        <div className="mt-10 p-5 border rounded-2xl bg-white/60">
          <h4 className="text-base font-semibold">{t.downloadTitle}</h4>
          <p className="mt-1 text-sm opacity-80">{t.downloadDesc}</p>

          <div className="mt-4 inline-flex items-center gap-3">
            {/* This endpoint requires the admin cookie token (you’ve already set up /admin/reconcile auth). */}
            <a
              href="/api/admin/reconcile/list?format=csv"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>{t.downloadBtn}</Button>
            </a>
            <span className="text-xs opacity-60">{t.help}</span>
          </div>
        </div>
      </Section>
    </main>
  );
}
