"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import StatusBadge from "@/components/gauges/StatusBadge";
import { useCalcStore } from "@/store/useCalcStore";
import { classifyEirp } from "@/lib/rf/eirp";
import { requiredEirpForRange, requiredGainDbi, requiredTxDbm } from "@/lib/rf/inverse";
import { clamp } from "@/lib/utils/clamp";
import { formatLength } from "@/lib/utils/format";

const MODES = [
  { value: "eirp", label: "Target EIRP" },
  { value: "range", label: "Target jangkauan" },
];

const TX_RANGE = [-30, 40];
const GAIN_RANGE = [0, 30];

export default function InverseCalculator() {
  const state = useCalcStore();
  const update = useCalcStore((s) => s.update);
  const [mode, setMode] = useState("eirp");
  const [targetEirp, setTargetEirp] = useState(20);
  const [targetRange, setTargetRange] = useState(100);

  const requiredEirp = mode === "eirp" ? targetEirp : requiredEirpForRange(targetRange, state);
  const txNeeded = requiredTxDbm(requiredEirp, state);
  const gainNeeded = requiredGainDbi(requiredEirp, state);
  const status = classifyEirp(requiredEirp, false);
  const txOk = txNeeded >= TX_RANGE[0] && txNeeded <= TX_RANGE[1];
  const gainOk = gainNeeded >= GAIN_RANGE[0] && gainNeeded <= GAIN_RANGE[1];

  return (
    <Card title="Hitung terbalik" tip="linkbudget" action={<StatusBadge level={status.level} label={status.label} />}>
      <div className="flex flex-col gap-4">
        <SegmentedControl options={MODES} value={mode} onChange={setMode} />
        {mode === "eirp" ? (
          <NumberField label="EIRP yang diinginkan" tip="eirp" unit="dBm" value={targetEirp} min={-30} max={60} step={0.5} onChange={setTargetEirp} />
        ) : (
          <NumberField label="Jangkauan yang diinginkan" unit="m" value={targetRange} min={1} max={50000} step={10} onChange={setTargetRange} />
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">EIRP dibutuhkan</dt>
          <dd className="num text-right text-ink">{requiredEirp.toFixed(1)} dBm</dd>
          <dt className="text-muted">Daya TX (antena sekarang)</dt>
          <dd className="num text-right text-ink">{txNeeded.toFixed(1)} dBm</dd>
          <dt className="text-muted">Gain (daya TX sekarang)</dt>
          <dd className="num text-right text-ink">{gainNeeded.toFixed(1)} dBi</dd>
          {mode === "eirp" && (
            <>
              <dt className="text-muted">Jangkauan di EIRP ini</dt>
              <dd className="num text-right text-ink">lihat tab Link</dd>
            </>
          )}
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!txOk}
            onClick={() => update({ txDbm: clamp(Math.round(txNeeded * 2) / 2, TX_RANGE[0], TX_RANGE[1]) })}
          >
            Terapkan daya TX
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!gainOk}
            onClick={() => update({ gainDbi: clamp(Math.round(gainNeeded * 2) / 2, GAIN_RANGE[0], GAIN_RANGE[1]) })}
          >
            Terapkan gain
          </Button>
        </div>
        {(!txOk || !gainOk) && (
          <p className="text-xs leading-relaxed text-faint">
            Tombol yang nonaktif berarti nilainya di luar rentang yang bisa diatur (daya TX {TX_RANGE[0]} sampai {TX_RANGE[1]} dBm, gain {GAIN_RANGE[0]} sampai {GAIN_RANGE[1]} dBi). Ubah gabungan keduanya.
          </p>
        )}
        {mode === "range" && (
          <p className="text-xs leading-relaxed text-faint">
            Jangkauan {formatLength(targetRange)} dihitung dengan sensitivitas, fade margin, lingkungan, dan dinding yang sedang diatur di sidebar dan tab Link.
          </p>
        )}
      </div>
    </Card>
  );
}
