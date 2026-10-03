"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "./StatusBadge";
import { useCalcStore } from "@/store/useCalcStore";
import { computeEirp, classifyEirp } from "@/lib/rf/eirp";
import { dbmToMw } from "@/lib/rf/units";
import { describeStatus } from "@/lib/rf/statusInfo";
import { formatPower } from "@/lib/utils/format";
import { clamp } from "@/lib/utils/clamp";

const MIN = -10;
const MAX = 40;
const CX = 120;
const CY = 118;
const R = 98;

function point(t, radius) {
  const angle = Math.PI * (1 - t);
  return [CX + radius * Math.cos(angle), CY - radius * Math.sin(angle)];
}

function arc(t0, t1, radius) {
  const [x0, y0] = point(t0, radius);
  const [x1, y1] = point(t1, radius);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${radius},${radius} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

const toT = (dbm) => clamp((dbm - MIN) / (MAX - MIN), 0, 1);

export default function EirpGauge() {
  const txDbm = useCalcStore((s) => s.txDbm);
  const gainDbi = useCalcStore((s) => s.gainDbi);
  const cableLossDb = useCalcStore((s) => s.cableLossDb);
  const antCount = useCalcStore((s) => s.antCount);
  const sourceMode = useCalcStore((s) => s.sourceMode);
  const phaseMode = useCalcStore((s) => s.phaseMode);
  const splitterExtraDb = useCalcStore((s) => s.splitterExtraDb);
  const isolated = useCalcStore((s) => s.isolated);

  const result = useMemo(
    () => computeEirp({ txDbm, gainDbi, cableLossDb, antCount, sourceMode, phaseMode, splitterExtraDb }),
    [txDbm, gainDbi, cableLossDb, antCount, sourceMode, phaseMode, splitterExtraDb]
  );
  const status = classifyEirp(result.eirpDbm, isolated);
  const info = describeStatus(status.level, result.eirpDbm);
  const t = toT(result.eirpDbm);
  const [px0, py0] = point(t, R - 14);
  const [px1, py1] = point(t, R + 6);

  return (
    <Card title="EIRP" action={<StatusBadge level={status.level} label={status.label} />}>
      <svg viewBox="0 0 240 136" className="mx-auto block w-full max-w-sm" role="img" aria-label={`EIRP ${result.eirpDbm.toFixed(1)} dBm`}>
        <path d={arc(0, 1, R)} fill="none" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
        {t > 0.005 && (
          <path d={arc(0, t, R)} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        )}
        {[20, 30].map((mark) => {
          const [ax, ay] = point(toT(mark), R - 8);
          const [bx, by] = point(toT(mark), R + 6);
          const [lx, ly] = point(toT(mark), R - 20);
          return (
            <g key={mark}>
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--faint)" strokeWidth="1.5" />
              <text x={lx} y={ly} fontSize="9" textAnchor="middle" fill="var(--faint)" className="num">
                {mark}
              </text>
            </g>
          );
        })}
        <line x1={px0} y1={py0} x2={px1} y2={py1} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <text x={CX} y={CY - 26} textAnchor="middle" fontSize="38" fontWeight="300" fill="var(--ink)" className="num">
          {result.eirpDbm.toFixed(1)}
        </text>
        <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fill="var(--faint)">
          dBm
        </text>
      </svg>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted">Daya setara</dt>
        <dd className="num text-right text-ink">{formatPower(dbmToMw(result.eirpDbm))}</dd>
        <dt className="text-muted">Per antena</dt>
        <dd className="num text-right text-ink">{result.perAntennaDbm.toFixed(1)} dBm</dd>
        <dt className="text-muted">Gain susunan</dt>
        <dd className="num text-right text-ink">{result.arrayGainDb.toFixed(1)} dB</dd>
      </dl>
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-sm font-medium text-ink">{info.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{info.body}</p>
      </div>
    </Card>
  );
}
