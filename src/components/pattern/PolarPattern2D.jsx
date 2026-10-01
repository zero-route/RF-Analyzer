"use client";

import Card from "@/components/ui/Card";
import { useCalcStore } from "@/store/useCalcStore";
import { beamwidths, polarPath } from "@/lib/rf/pattern";

const CENTER = 100;
const MAX_R = 78;

function Grid() {
  return (
    <g stroke="var(--line)" strokeWidth="1" fill="none">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <circle key={f} cx={CENTER} cy={CENTER} r={MAX_R * f} />
      ))}
      <line x1={CENTER - MAX_R} y1={CENTER} x2={CENTER + MAX_R} y2={CENTER} />
      <line x1={CENTER} y1={CENTER - MAX_R} x2={CENTER} y2={CENTER + MAX_R} />
    </g>
  );
}

function Lobe({ d, rotate }) {
  return (
    <path
      d={d}
      transform={rotate ? `rotate(${rotate} ${CENTER} ${CENTER})` : undefined}
      fill="var(--accent)"
      fillOpacity="0.16"
      stroke="var(--accent)"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
  );
}

export default function PolarPattern2D() {
  const antennaType = useCalcStore((s) => s.antennaType);
  const gainDbi = useCalcStore((s) => s.gainDbi);
  const sectorH = useCalcStore((s) => s.sectorH);
  const bw = beamwidths({ type: antennaType, gainDbi, sectorH });
  const azimuth = polarPath(bw.h, MAX_R, CENTER, CENTER, 3);
  const elevation = polarPath(bw.v, MAX_R, CENTER, CENTER, 3);
  const omni = antennaType === "omni";

  return (
    <Card title="Potongan pola">
      <div className="grid grid-cols-2 gap-4">
        <figure className="flex flex-col gap-2">
          <svg viewBox="0 0 200 200" className="block w-full" role="img" aria-label="Pola azimuth tampak atas">
            <Grid />
            <Lobe d={azimuth} />
            <text x={CENTER} y="12" textAnchor="middle" fontSize="10" fill="var(--faint)">
              0°
            </text>
          </svg>
          <figcaption className="text-center text-xs text-muted">Azimuth (tampak atas)</figcaption>
        </figure>
        <figure className="flex flex-col gap-2">
          <svg viewBox="0 0 200 200" className="block w-full" role="img" aria-label="Pola elevasi tampak samping">
            <Grid />
            <Lobe d={elevation} rotate={90} />
            {omni && <Lobe d={elevation} rotate={-90} />}
            <text x="196" y={CENTER - 6} textAnchor="end" fontSize="10" fill="var(--faint)">
              Depan
            </text>
          </svg>
          <figcaption className="text-center text-xs text-muted">Elevasi (tampak samping)</figcaption>
        </figure>
      </div>
    </Card>
  );
}
