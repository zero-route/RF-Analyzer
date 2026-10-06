"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { gammaFromReturnLoss, gammaFromVswr, mismatchStats } from "@/lib/rf/tools";

const MODES = [
  { value: "vswr", label: "VSWR" },
  { value: "rl", label: "Return loss" },
];

export default function MismatchCalculator() {
  const [mode, setMode] = useState("vswr");
  const [vswr, setVswr] = useState(1.5);
  const [rl, setRl] = useState(14);

  const gamma = mode === "vswr" ? gammaFromVswr(Math.max(vswr, 1)) : gammaFromReturnLoss(Math.max(rl, 0));
  const stats = mismatchStats(gamma);

  return (
    <Card title="VSWR dan rugi ketidakcocokan" tip="vswr">
      <div className="flex flex-col gap-4">
        <SegmentedControl options={MODES} value={mode} onChange={setMode} />
        {mode === "vswr" ? (
          <NumberField label="VSWR" unit=": 1" value={vswr} min={1} max={50} step={0.1} onChange={setVswr} />
        ) : (
          <NumberField label="Return loss" unit="dB" value={rl} min={0} max={80} step={0.5} onChange={setRl} />
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">VSWR</dt>
          <dd className="num text-right text-ink">{stats.vswr.toFixed(2)} : 1</dd>
          <dt className="text-muted">Return loss</dt>
          <dd className="num text-right text-ink">
            {Number.isFinite(stats.returnLossDb) ? `${stats.returnLossDb.toFixed(1)} dB` : "tak hingga"}
          </dd>
          <dt className="text-muted">Rugi ketidakcocokan</dt>
          <dd className="num text-right text-ink">{stats.mismatchLossDb.toFixed(3)} dB</dd>
          <dt className="text-muted">Daya terpantul</dt>
          <dd className="num text-right text-ink">{stats.reflectedPercent.toFixed(2)}%</dd>
        </dl>
      </div>
    </Card>
  );
}
