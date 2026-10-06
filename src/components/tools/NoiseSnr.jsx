"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useCalcStore } from "@/store/useCalcStore";
import { useRfModel } from "@/hooks/useRfModel";
import { noiseFloorDbm } from "@/lib/rf/tools";

const BANDWIDTHS = [
  { value: 20, label: "20" },
  { value: 40, label: "40" },
  { value: 80, label: "80" },
  { value: 160, label: "160" },
];

function quality(snr) {
  if (snr >= 25) return { tone: "safe", label: "Sangat baik" };
  if (snr >= 15) return { tone: "safe", label: "Baik" };
  if (snr >= 10) return { tone: "permit", label: "Cukup" };
  return { tone: "danger", label: "Lemah" };
}

export default function NoiseSnr() {
  const { link } = useRfModel();
  const bandwidth = useCalcStore((s) => s.bandwidthMHz);
  const noiseFigure = useCalcStore((s) => s.noiseFigureDb);
  const update = useCalcStore((s) => s.update);

  const floor = noiseFloorDbm(bandwidth, noiseFigure);
  const snr = link.rxPowerDbm - floor;
  const q = quality(snr);

  return (
    <Card title="Noise floor dan SNR" tip="snr" action={<Badge tone={q.tone}>{q.label}</Badge>}>
      <div className="flex flex-col gap-4">
        <SegmentedControl
          label="Lebar kanal (MHz)"
          options={BANDWIDTHS}
          value={bandwidth}
          onChange={(v) => update({ bandwidthMHz: v })}
        />
        <NumberField
          label="Noise figure penerima"
          unit="dB"
          value={noiseFigure}
          min={0}
          max={30}
          step={0.5}
          onChange={(v) => update({ noiseFigureDb: v })}
        />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">Noise floor</dt>
          <dd className="num text-right text-ink">{floor.toFixed(1)} dBm</dd>
          <dt className="text-muted">Daya terima (tab Link)</dt>
          <dd className="num text-right text-ink">{link.rxPowerDbm.toFixed(1)} dBm</dd>
          <dt className="text-muted">SNR</dt>
          <dd className="num text-right text-ink">{snr.toFixed(1)} dB</dd>
        </dl>
        <p className="text-xs leading-relaxed text-faint">
          Hanya noise termal. Interferensi dari perangkat lain di sekitar akan menurunkan SNR sebenarnya.
        </p>
      </div>
    </Card>
  );
}
