"use client";

import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useCalcStore } from "@/store/useCalcStore";
import { BANDS } from "@/lib/data/bands";

export default function FrequencyPicker() {
  const freqMHz = useCalcStore((s) => s.freqMHz);
  const update = useCalcStore((s) => s.update);
  const options = BANDS.map((b) => ({ value: b.freqMHz, label: b.label }));

  return (
    <Card title="Frekuensi (GHz)">
      <div className="flex flex-col gap-4">
        <SegmentedControl
          options={options}
          value={freqMHz}
          onChange={(v) => update({ freqMHz: v })}
        />
        <NumberField
          label="Frekuensi tepat"
          unit="MHz"
          value={freqMHz}
          min={100}
          max={7200}
          step={1}
          onChange={(v) => update({ freqMHz: v })}
        />
      </div>
    </Card>
  );
}
