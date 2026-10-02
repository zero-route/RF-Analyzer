"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useRfModel } from "@/hooks/useRfModel";
import { EXPOSURE_LIMITS } from "@/lib/data/regulations";
import { powerDensityWm2, safeDistanceM } from "@/lib/rf/exposure";
import { formatLength } from "@/lib/utils/format";

const FRACTIONS = [1, 0.5, 0.1];
const RING_MAX = 78;
const CENTER = 100;

export default function ExposureRings() {
  const { state, eirp } = useRfModel();
  const [group, setGroup] = useState("public");
  const limit = EXPOSURE_LIMITS.find((l) => l.value === group);
  const rings = FRACTIONS.map((f) => ({
    fraction: f,
    distanceM: safeDistanceM(eirp.eirpDbm, limit.limitWm2 * f),
  }));
  const maxDistance = rings[rings.length - 1].distanceM;
  const density = powerDensityWm2(eirp.eirpDbm, state.distanceM);
  const percent = (density / limit.limitWm2) * 100;
  const opacities = [0.28, 0.16, 0.07];

  return (
    <Card title="Jarak aman paparan RF">
      <div className="flex flex-col gap-4">
        <SegmentedControl
          options={EXPOSURE_LIMITS.map((l) => ({ value: l.value, label: l.label }))}
          value={group}
          onChange={setGroup}
        />
        <svg viewBox="0 0 200 200" className="mx-auto block w-full max-w-xs" role="img" aria-label="Cincin jarak aman paparan RF">
          {[...rings].reverse().map((ring, i) => {
            const idx = rings.length - 1 - i;
            const r = (ring.distanceM / maxDistance) * RING_MAX;
            return (
              <g key={ring.fraction}>
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={r}
                  fill="var(--accent)"
                  fillOpacity={opacities[idx]}
                  stroke="var(--accent)"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? undefined : "3 3"}
                />
              </g>
            );
          })}
          <circle cx={CENTER} cy={CENTER} r="3" fill="var(--ink)" />
        </svg>
        <ul>
          {rings.map((ring) => (
            <li
              key={ring.fraction}
              className="flex items-baseline justify-between border-b border-line py-2 text-sm last:border-b-0"
            >
              <span className="text-muted">Kerapatan {Math.round(ring.fraction * 100)}% dari batas</span>
              <span className="num text-ink">{formatLength(ring.distanceM)}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-md bg-sunken p-3 text-sm">
          <p className="text-muted">
            Pada jarak {formatLength(state.distanceM)}: <span className="num text-ink">{density.toFixed(4)} W/m²</span> (
            <span className="num text-ink">{percent.toFixed(2)}%</span> dari batas {limit.limitWm2} W/m²)
          </p>
        </div>
        <p className="text-xs leading-relaxed text-faint">
          Rumus medan jauh. Sangat dekat dengan antena (beberapa panjang gelombang), hasilnya tidak valid.
        </p>
      </div>
    </Card>
  );
}
