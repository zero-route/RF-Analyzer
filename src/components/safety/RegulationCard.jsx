"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useCalcStore } from "@/store/useCalcStore";
import { useRfModel } from "@/hooks/useRfModel";
import { REGIONS, findLimit, getRegion, limitsFor } from "@/lib/data/regulations";

export default function RegulationCard() {
  const { state, eirp } = useRfModel();
  const update = useCalcStore((s) => s.update);
  const region = getRegion(state.region);
  const limits = limitsFor(region, state);
  const match = findLimit(region, state, state.freqMHz);
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
      <div className="flex flex-col gap-4">
        <SegmentedControl
          label="Wilayah"
          options={REGIONS.map((r) => ({ value: r.id, label: r.label }))}
          value={region.id}
          onChange={(v) => update({ region: v })}
        />

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
          <p className="text-sm text-muted">Frekuensi {state.freqMHz} MHz tidak punya acuan di profil {region.label}.</p>
        )}

        {region.custom ? (
          <div className="grid gap-3 border-t border-line pt-4">
            {limits.map((l) => (
              <NumberField
                key={l.id}
                label={l.label}
                unit="dBm"
                value={l.limitDbm}
                min={0}
                max={60}
                step={0.5}
                onChange={(v) => update({ [l.key]: v })}
              />
            ))}
          </div>
        ) : (
          <ul className="border-t border-line pt-3">
            {limits.map((l) => (
              <li key={l.id} className="flex items-baseline justify-between gap-3 py-1 text-xs text-muted">
                <span>{l.label}</span>
                <span className="num text-ink">{l.limitDbm} dBm</span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs leading-relaxed text-faint">
          {region.note} Profil ini juga menentukan daftar kanal 2.4 dan 6 GHz di tab Kanal. Selalu cek aturan resmi terbaru sebelum dipakai sebagai dasar izin.
        </p>
      </div>
    </Card>
  );
}
