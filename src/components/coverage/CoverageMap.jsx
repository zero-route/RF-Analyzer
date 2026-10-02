"use client";

import Card from "@/components/ui/Card";
import { useRfModel } from "@/hooks/useRfModel";
import { useIsDark } from "@/hooks/useIsDark";
import { beamwidths, lobeRadius } from "@/lib/rf/pattern";
import { fsplDb } from "@/lib/rf/fspl";
import { rampColor } from "@/lib/utils/colorRamp";
import { clamp } from "@/lib/utils/clamp";
import { formatLength } from "@/lib/utils/format";

const N = 31;
const SIZE = 240;
const SPAN_DB = 50;

export default function CoverageMap() {
  const { state: s, eirp, range } = useRfModel();
  const dark = useIsDark();
  const bw = beamwidths({ type: s.antennaType, gainDbi: s.gainDbi, sectorH: s.sectorH });
  const finite = Number.isFinite(range) ? range : 100;
  const half = clamp(finite * 1.2, 5, 5000);
  const low = s.rxSensitivityDbm;
  const cell = SIZE / N;
  const rects = [];

  for (let gy = 0; gy < N; gy += 1) {
    for (let gx = 0; gx < N; gx += 1) {
      const x = (((gx + 0.5) / N) * 2 - 1) * half;
      const y = (1 - ((gy + 0.5) / N) * 2) * half;
      const d = Math.max(Math.hypot(x, y), 0.5);
      const az = (Math.atan2(x, y) * 180) / Math.PI;
      const rel = lobeRadius(az, bw.h);
      const rx =
        eirp.eirpDbm +
        10 * Math.log10(Math.max(rel, 1e-3)) -
        fsplDb(d, s.freqMHz) -
        s.obstructionDb +
        s.rxGainDbi -
        s.rxCableLossDb;
      if (rx < low) continue;
      rects.push(
        <rect
          key={`${gx}-${gy}`}
          x={gx * cell}
          y={gy * cell}
          width={cell + 0.4}
          height={cell + 0.4}
          fill={rampColor(clamp((rx - low) / SPAN_DB, 0, 1), dark)}
        />
      );
    }
  }

  const stops = [0, 0.25, 0.5, 0.75, 1].map((t) => `${rampColor(t, dark)} ${t * 100}%`).join(", ");
  const rangePx = (clamp(finite / half, 0, 1.4) * SIZE) / 2;

  return (
    <Card title="Peta cakupan (tampak atas)">
      <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-md border border-line bg-sunken">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block h-full w-full" role="img" aria-label="Peta cakupan sinyal">
          {rects}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={rangePx}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line x1={SIZE / 2} y1={SIZE / 2} x2={SIZE / 2} y2={SIZE / 2 - 16} stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={SIZE / 2} cy={SIZE / 2} r="3.5" fill="var(--ink)" />
        </svg>
      </div>
      <div className="mx-auto mt-4 w-full max-w-sm">
        <div className="h-2 rounded-sm" style={{ background: `linear-gradient(to right, ${stops})` }} />
        <div className="mt-1.5 flex justify-between text-xs text-faint">
          <span>Batas sensitivitas</span>
          <span>Sinyal kuat</span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">Sisi peta</dt>
          <dd className="num text-right text-ink">± {formatLength(half)}</dd>
          <dt className="text-muted">Jangkauan arah depan</dt>
          <dd className="num text-right text-ink">{formatLength(range)}</dd>
        </dl>
        <p className="mt-3 text-xs text-faint">Garis putus-putus menandai jangkauan arah depan antena. Panah menunjukkan arah depan.</p>
      </div>
    </Card>
  );
}
