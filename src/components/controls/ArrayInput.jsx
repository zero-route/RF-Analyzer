"use client";

import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Slider from "@/components/ui/Slider";
import { useCalcStore } from "@/store/useCalcStore";

const ISOLATED = [
  { value: false, label: "Tidak" },
  { value: true, label: "Ya" },
];

export default function ArrayInput() {
  const antCount = useCalcStore((s) => s.antCount);
  const isolated = useCalcStore((s) => s.isolated);
  const update = useCalcStore((s) => s.update);

  return (
    <Card title="Jumlah antena">
      <div className="flex flex-col gap-4">
        <Slider
          label="Antena"
          value={antCount}
          min={1}
          max={12}
          step={1}
          digits={0}
          onChange={(v) => update({ antCount: v })}
        />
        <SegmentedControl
          label="Dummy load (terisolasi)"
          options={ISOLATED}
          value={isolated}
          onChange={(v) => update({ isolated: v })}
        />
      </div>
    </Card>
  );
}
