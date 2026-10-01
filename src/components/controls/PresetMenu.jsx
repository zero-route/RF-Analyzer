"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useCalcStore } from "@/store/useCalcStore";
import { ANTENNA_PRESETS } from "@/lib/data/antennas";

export default function PresetMenu() {
  const update = useCalcStore((s) => s.update);
  const reset = useCalcStore((s) => s.reset);

  function apply(id) {
    const preset = ANTENNA_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    update({
      gainDbi: preset.gainDbi,
      antennaType: preset.type,
      sectorH: preset.sectorH ?? 90,
    });
  }

  return (
    <Card title="Preset antena">
      <div className="flex flex-col gap-3">
        <select
          aria-label="Preset antena"
          defaultValue=""
          onChange={(e) => apply(e.target.value)}
          className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
        >
          <option value="" disabled>
            Pilih preset
          </option>
          {ANTENNA_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="sm" onClick={reset} className="self-start">
          Setel ulang semua
        </Button>
      </div>
    </Card>
  );
}
