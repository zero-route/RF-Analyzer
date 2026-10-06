"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useCalcStore } from "@/store/useCalcStore";
import { ENVIRONMENTS, WALL_TYPES, pathExponent, wallLossDb } from "@/lib/rf/propagation";

const MAX_WALLS = 20;

export default function PropagationInput() {
  const state = useCalcStore();
  const update = useCalcStore((s) => s.update);

  return (
    <Card title="Lingkungan dan dinding" tip="pathloss">
      <div className="flex flex-col gap-4">
        <SegmentedControl
          label="Lingkungan"
          options={ENVIRONMENTS.map((e) => ({ value: e.value, label: e.label }))}
          value={state.environment}
          onChange={(v) => update({ environment: v })}
        />
        <ul>
          {WALL_TYPES.map((wall) => {
            const count = state[wall.key] || 0;
            return (
              <li
                key={wall.key}
                className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0"
              >
                <span className="text-sm text-muted">{wall.label}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Kurangi ${wall.label}`}
                    disabled={count <= 0}
                    onClick={() => update({ [wall.key]: count - 1 })}
                    className="w-8 px-0"
                  >
                    −
                  </Button>
                  <span className="num w-5 text-center text-sm text-ink">{count}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Tambah ${wall.label}`}
                    disabled={count >= MAX_WALLS}
                    onClick={() => update({ [wall.key]: count + 1 })}
                    className="w-8 px-0"
                  >
                    +
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">Rugi dinding</dt>
          <dd className="num text-right text-ink">{wallLossDb(state).toFixed(1)} dB</dd>
          <dt className="text-muted">Eksponen lintasan</dt>
          <dd className="num text-right text-ink">n = {pathExponent(state).toFixed(1)}</dd>
        </dl>
        <p className="text-xs leading-relaxed text-faint">
          Nilai rugi dinding adalah perkiraan umum per pita, hasil nyata bergantung ketebalan dan bahan. Tambahkan jumlah dinding yang dilewati sinyal antara pemancar dan penerima.
        </p>
      </div>
    </Card>
  );
}
