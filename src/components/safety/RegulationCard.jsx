"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { useRfModel } from "@/hooks/useRfModel";
import { REFERENCE_LIMITS, REGULATION_NOTE } from "@/lib/data/regulations";

export default function RegulationCard() {
  const { state, eirp } = useRfModel();
  const match = REFERENCE_LIMITS.find((r) => state.freqMHz >= r.minMHz && state.freqMHz <= r.maxMHz);
  const margin = match ? match.limitDbm - eirp.eirpDbm : null;
  const ok = margin !== null && margin >= 0;

  return (
    <Card
      title="Acuan batas EIRP"
      action={
        match ? (
          <Badge tone={ok ? "safe" : "danger"}>{ok ? "Di bawah acuan" : "Melebihi acuan"}</Badge>
        ) : (
          <Badge tone="neutral">Tanpa acuan</Badge>
        )
      }
    >
      {match ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">Pita</dt>
          <dd className="text-right text-ink">{match.label}</dd>
          <dt className="text-muted">Batas acuan</dt>
          <dd className="num text-right text-ink">{match.limitDbm.toFixed(1)} dBm</dd>
          <dt className="text-muted">EIRP kamu</dt>
          <dd className="num text-right text-ink">{eirp.eirpDbm.toFixed(1)} dBm</dd>
          <dt className="text-muted">Selisih</dt>
          <dd className="num text-right text-ink">
            {margin >= 0 ? "+" : "−"}
            {Math.abs(margin).toFixed(1)} dB
          </dd>
        </dl>
      ) : (
        <p className="text-sm text-muted">Frekuensi {state.freqMHz} MHz tidak punya acuan di daftar ini.</p>
      )}
      <ul className="mt-4 border-t border-line pt-3">
        {REFERENCE_LIMITS.map((r) => (
          <li key={r.id} className="flex items-baseline justify-between gap-3 py-1 text-xs text-muted">
            <span>{r.label}</span>
            <span className="num text-ink">{r.limitDbm} dBm</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-faint">{REGULATION_NOTE}</p>
    </Card>
  );
}
