"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Slider from "@/components/ui/Slider";
import { useRfModel } from "@/hooks/useRfModel";
import { fresnelProfile, fresnelRadiusM } from "@/lib/rf/fresnel";
import { clamp } from "@/lib/utils/clamp";
import { formatLength } from "@/lib/utils/format";

const W = 320;
const H = 190;
const GROUND = 170;
const TOP = 14;

export default function FresnelView() {
  const { state: s } = useRfModel();
  const [h1, setH1] = useState(3);
  const [h2, setH2] = useState(3);
  const [obsH, setObsH] = useState(0);
  const [obsPos, setObsPos] = useState(50);

  const D = Math.max(s.distanceM, 1);
  const profile = fresnelProfile(D, s.freqMHz, 48);
  const lineY = (x) => h1 + (h2 - h1) * (x / D);
  const maxY = Math.max(...profile.map((p) => lineY(p.x) + p.radius), h1, h2, obsH, 1) * 1.08;
  const sx = (x) => 10 + (x / D) * (W - 20);
  const sy = (y) => GROUND - (clamp(y, 0, maxY) / maxY) * (GROUND - TOP);

  const zonePath = (k) => {
    const top = profile.map((p) => `${sx(p.x).toFixed(1)},${sy(lineY(p.x) + p.radius * k).toFixed(1)}`);
    const bottom = [...profile]
      .reverse()
      .map((p) => `${sx(p.x).toFixed(1)},${sy(lineY(p.x) - p.radius * k).toFixed(1)}`);
    return `M${top.join(" L")} L${bottom.join(" L")} Z`;
  };

  const inner = profile.slice(1, -1);
  const groundRatio = Math.min(...inner.map((p) => lineY(p.x) / Math.max(p.radius, 1e-6)));
  const d1 = (D * obsPos) / 100;
  const obsRadius = fresnelRadiusM(d1, D - d1, s.freqMHz);
  const obsRatio = obsH > 0 ? (lineY(d1) - obsH) / Math.max(obsRadius, 1e-6) : Infinity;
  const ratio = Math.min(groundRatio, obsRatio);
  const midRadius = fresnelRadiusM(D / 2, D / 2, s.freqMHz);

  let tone = "safe";
  let label = "Zona Fresnel bersih";
  if (ratio < 0) {
    tone = "danger";
    label = "Garis pandang terhalang";
  } else if (ratio < 0.6) {
    tone = "permit";
    label = "Terhalang sebagian";
  }

  return (
    <Card title="Zona Fresnel (tampak samping)" action={<Badge tone={tone}>{label}</Badge>}>
      <div className="flex flex-col gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Penampang zona Fresnel pertama">
          <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="var(--sunken)" />
          <path d={zonePath(1)} fill="var(--accent)" fillOpacity="0.1" stroke="var(--faint)" strokeWidth="1" />
          <path d={zonePath(0.6)} fill="var(--accent)" fillOpacity="0.12" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={sx(0)} y1={sy(h1)} x2={sx(D)} y2={sy(h2)} stroke="var(--accent)" strokeWidth="1.5" />
          <line x1={sx(0)} y1={GROUND} x2={sx(0)} y2={sy(h1)} stroke="var(--ink)" strokeWidth="2" />
          <line x1={sx(D)} y1={GROUND} x2={sx(D)} y2={sy(h2)} stroke="var(--ink)" strokeWidth="2" />
          <circle cx={sx(0)} cy={sy(h1)} r="3.5" fill="var(--ink)" />
          <circle cx={sx(D)} cy={sy(h2)} r="3.5" fill="var(--ink)" />
          {obsH > 0 && (
            <rect x={sx(d1) - 5} y={sy(obsH)} width="10" height={GROUND - sy(obsH)} fill="var(--faint)" />
          )}
          <line x1="0" y1={GROUND} x2={W} y2={GROUND} stroke="var(--line)" strokeWidth="1" />
          <text x="10" y={H - 4} fontSize="10" fill="var(--faint)">
            TX
          </text>
          <text x={W - 10} y={H - 4} fontSize="10" textAnchor="end" fill="var(--faint)">
            RX · {formatLength(D)}
          </text>
        </svg>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">Radius Fresnel di tengah</dt>
          <dd className="num text-right text-ink">{formatLength(midRadius)}</dd>
          <dt className="text-muted">Kelonggaran minimum</dt>
          <dd className="num text-right text-ink">{(ratio === Infinity ? 100 : ratio * 100).toFixed(0)}% radius</dd>
        </dl>
        <div className="grid gap-5">
          <Slider label="Tinggi antena TX" value={h1} min={0.5} max={50} step={0.5} unit="m" onChange={setH1} />
          <Slider label="Tinggi antena RX" value={h2} min={0.5} max={50} step={0.5} unit="m" onChange={setH2} />
          <Slider label="Tinggi halangan" value={obsH} min={0} max={50} step={0.5} unit="m" onChange={setObsH} />
          {obsH > 0 && (
            <Slider label="Posisi halangan" value={obsPos} min={10} max={90} step={1} unit="%" digits={0} onChange={setObsPos} />
          )}
        </div>
        <p className="text-xs leading-relaxed text-faint">
          Zona bersih bila minimal 60% radius Fresnel pertama bebas halangan (garis putus-putus). Jarak dan frekuensi mengikuti tab Link dan sidebar.
        </p>
      </div>
    </Card>
  );
}
