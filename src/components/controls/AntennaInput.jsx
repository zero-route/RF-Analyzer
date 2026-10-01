"use client";

import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Slider from "@/components/ui/Slider";
import { useCalcStore } from "@/store/useCalcStore";

const TYPES = [
  { value: "omni", label: "Omni" },
  { value: "sector", label: "Sektoral" },
  { value: "directional", label: "Direksional" },
];

export default function AntennaInput() {
  const gainDbi = useCalcStore((s) => s.gainDbi);
  const antennaType = useCalcStore((s) => s.antennaType);
  const sectorH = useCalcStore((s) => s.sectorH);
  const update = useCalcStore((s) => s.update);

  return (
    <Card title="Antena">
      <div className="flex flex-col gap-4">
        <SegmentedControl
          options={TYPES}
          value={antennaType}
          onChange={(v) => update({ antennaType: v })}
        />
        <Slider
          label="Gain"
          value={gainDbi}
          min={0}
          max={30}
          step={0.5}
          unit="dBi"
          onChange={(v) => update({ gainDbi: v })}
        />
        {antennaType === "sector" && (
          <Slider
            label="Lebar sektor"
            value={sectorH}
            min={30}
            max={180}
            step={5}
            unit="°"
            digits={0}
            onChange={(v) => update({ sectorH: v })}
          />
        )}
      </div>
    </Card>
  );
}
