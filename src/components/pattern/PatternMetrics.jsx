"use client";

import Card from "@/components/ui/Card";
import { useCalcStore } from "@/store/useCalcStore";
import { beamwidths, flatness } from "@/lib/rf/pattern";

export default function PatternMetrics() {
  const antennaType = useCalcStore((s) => s.antennaType);
  const gainDbi = useCalcStore((s) => s.gainDbi);
  const sectorH = useCalcStore((s) => s.sectorH);
  const bw = beamwidths({ type: antennaType, gainDbi, sectorH });
  const flat = flatness(bw.h, bw.v);

  return (
    <Card title="Metrik pola">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted">Lebar sinar horizontal</dt>
        <dd className="num text-right text-ink">{bw.h.toFixed(0)}°</dd>
        <dt className="text-muted">Lebar sinar vertikal</dt>
        <dd className="num text-right text-ink">{bw.v.toFixed(0)}°</dd>
        <dt className="text-muted">Kepipihan</dt>
        <dd className="num text-right text-ink">
          {flat.label} ({flat.ratio.toFixed(1)}×)
        </dd>
        <dt className="text-muted">Gain</dt>
        <dd className="num text-right text-ink">{gainDbi.toFixed(1)} dBi</dd>
      </dl>
    </Card>
  );
}
