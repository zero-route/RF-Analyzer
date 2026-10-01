"use client";

import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Slider from "@/components/ui/Slider";
import { useCalcStore } from "@/store/useCalcStore";

const MODES = [
  { value: "independent", label: "Pemancar terpisah" },
  { value: "splitter", label: "1 modul + splitter" },
];

export default function SourceModeSwitch() {
  const sourceMode = useCalcStore((s) => s.sourceMode);
  const splitterExtraDb = useCalcStore((s) => s.splitterExtraDb);
  const antCount = useCalcStore((s) => s.antCount);
  const update = useCalcStore((s) => s.update);

  if (antCount < 2) return null;

  return (
    <Card title="Sumber sinyal">
      <div className="flex flex-col gap-4">
        <SegmentedControl
          options={MODES}
          value={sourceMode}
          onChange={(v) => update({ sourceMode: v })}
        />
        {sourceMode === "splitter" && (
          <Slider
            label="Rugi splitter tambahan"
            value={splitterExtraDb}
            min={0}
            max={3}
            step={0.1}
            unit="dB"
            onChange={(v) => update({ splitterExtraDb: v })}
          />
        )}
      </div>
    </Card>
  );
}
