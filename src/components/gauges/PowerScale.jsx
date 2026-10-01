"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import { useCalcStore } from "@/store/useCalcStore";
import { computeEirp } from "@/lib/rf/eirp";
import { clamp } from "@/lib/utils/clamp";

const MIN = -10;
const MAX = 40;
const W = 400;
const PAD = 16;
const TICKS = [
  { dbm: 0, label: "1 mW" },
  { dbm: 10, label: "10 mW" },
  { dbm: 20, label: "100 mW" },
  { dbm: 30, label: "1 W" },
  { dbm: 40, label: "10 W" },
];

const xAt = (dbm) => PAD + ((clamp(dbm, MIN, MAX) - MIN) / (MAX - MIN)) * (W - PAD * 2);

export default function PowerScale() {
  const txDbm = useCalcStore((s) => s.txDbm);
  const gainDbi = useCalcStore((s) => s.gainDbi);
  const cableLossDb = useCalcStore((s) => s.cableLossDb);
  const antCount = useCalcStore((s) => s.antCount);
  const sourceMode = useCalcStore((s) => s.sourceMode);
  const phaseMode = useCalcStore((s) => s.phaseMode);
  const splitterExtraDb = useCalcStore((s) => s.splitterExtraDb);

  const eirp = useMemo(
    () => computeEirp({ txDbm, gainDbi, cableLossDb, antCount, sourceMode, phaseMode, splitterExtraDb }).eirpDbm,
    [txDbm, gainDbi, cableLossDb, antCount, sourceMode, phaseMode, splitterExtraDb]
  );
  const x = xAt(eirp);

  return (
    <Card title="Skala daya (logaritmik)">
      <svg viewBox={`0 0 ${W} 72`} className="block w-full" role="img" aria-label="Posisi EIRP pada skala dBm dan mW">
        <rect x={xAt(MIN)} y="32" width={xAt(20) - xAt(MIN)} height="6" rx="3" fill="var(--line)" />
        <rect x={xAt(20)} y="32" width={xAt(30) - xAt(20)} height="6" fill="var(--faint)" />
        <rect x={xAt(30)} y="32" width={xAt(MAX) - xAt(30)} height="6" rx="3" fill="var(--accent)" />
        {TICKS.map((tick) => (
          <g key={tick.dbm}>
            <line x1={xAt(tick.dbm)} y1="40" x2={xAt(tick.dbm)} y2="46" stroke="var(--faint)" strokeWidth="1" />
            <text x={xAt(tick.dbm)} y="62" textAnchor="middle" fontSize="13" fill="var(--faint)" className="num">
              {tick.label}
            </text>
          </g>
        ))}
        <path d={`M${x - 5},18 L${x + 5},18 L${x},28 Z`} fill="var(--ink)" />
        <text x={clamp(x, 28, W - 28)} y="14" textAnchor="middle" fontSize="14" fontWeight="500" fill="var(--ink)" className="num">
          {eirp.toFixed(1)} dBm
        </text>
      </svg>
    </Card>
  );
}
