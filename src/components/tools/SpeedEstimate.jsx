"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useCalcStore } from "@/store/useCalcStore";
import { useRfModel } from "@/hooks/useRfModel";
import { noiseFloorDbm } from "@/lib/rf/tools";
import { REAL_FACTOR, estimateRate, formatRate } from "@/lib/rf/throughput";

const STREAMS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

export default function SpeedEstimate() {
  const { link } = useRfModel();
  const bandwidth = useCalcStore((s) => s.bandwidthMHz);
  const noiseFigure = useCalcStore((s) => s.noiseFigureDb);
  const [streams, setStreams] = useState(2);

  const snr = link.rxPowerDbm - noiseFloorDbm(bandwidth, noiseFigure);
  const rate = estimateRate(snr, bandwidth, streams);

  return (
    <Card title="Estimasi kecepatan" tip="mcs">
      <div className="flex flex-col gap-4">
        <SegmentedControl label="Spatial stream" options={STREAMS} value={streams} onChange={setStreams} />
        {rate ? (
          <div>
            <p className="num text-3xl font-light tracking-tight text-ink">{formatRate(rate.realMbps)}</p>
            <p className="mt-1 text-sm text-muted">perkiraan throughput nyata</p>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-light tracking-tight text-ink">Tidak terhubung</p>
            <p className="mt-1 text-sm text-muted">SNR terlalu rendah untuk tingkat modulasi terendah</p>
          </div>
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">SNR</dt>
          <dd className="num text-right text-ink">{snr.toFixed(1)} dB</dd>
          <dt className="text-muted">Modulasi</dt>
          <dd className="num text-right text-ink">{rate ? `MCS ${rate.index} · ${rate.name}` : "-"}</dd>
          <dt className="text-muted">Laju PHY</dt>
          <dd className="num text-right text-ink">{rate ? formatRate(rate.phyMbps) : "-"}</dd>
          <dt className="text-muted">Lebar kanal</dt>
          <dd className="num text-right text-ink">{bandwidth} MHz</dd>
        </dl>
        <p className="text-xs leading-relaxed text-faint">
          Perkiraan kasar berbasis tabel Wi-Fi 6 (GI 0.8 µs) dan ambang SNR umum. Throughput nyata diasumsikan {Math.round(REAL_FACTOR * 100)}% dari laju PHY, hasil sebenarnya bergantung perangkat, interferensi, dan jumlah pengguna.
        </p>
      </div>
    </Card>
  );
}
