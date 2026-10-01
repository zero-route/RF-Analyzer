"use client";

import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Slider from "@/components/ui/Slider";
import { useCalcStore } from "@/store/useCalcStore";
import { dbmToMw, mwToDbm } from "@/lib/rf/units";

const UNITS = [
  { value: "dbm", label: "dBm" },
  { value: "mw", label: "mW" },
];

export default function PowerInput() {
  const txDbm = useCalcStore((s) => s.txDbm);
  const txUnit = useCalcStore((s) => s.txUnit);
  const update = useCalcStore((s) => s.update);

  return (
    <Card title="Daya pemancar">
      <div className="flex flex-col gap-4">
        <SegmentedControl options={UNITS} value={txUnit} onChange={(v) => update({ txUnit: v })} />
        {txUnit === "dbm" ? (
          <NumberField
            label="Daya TX"
            unit="dBm"
            value={txDbm}
            min={-30}
            max={40}
            step={0.5}
            onChange={(v) => update({ txDbm: v })}
          />
        ) : (
          <NumberField
            label="Daya TX"
            unit="mW"
            value={Number(dbmToMw(txDbm).toFixed(3))}
            min={0.001}
            max={10000}
            step={1}
            onChange={(v) => update({ txDbm: mwToDbm(v) })}
          />
        )}
        <Slider
          label="Geser daya"
          value={txDbm}
          min={-20}
          max={36}
          step={0.5}
          unit="dBm"
          onChange={(v) => update({ txDbm: v })}
        />
      </div>
    </Card>
  );
}
