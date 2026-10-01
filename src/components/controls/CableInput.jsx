"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import Slider from "@/components/ui/Slider";
import { useCalcStore } from "@/store/useCalcStore";
import { CABLES, cableLossPerM } from "@/lib/data/cables";

export default function CableInput() {
  const cableLossDb = useCalcStore((s) => s.cableLossDb);
  const freqMHz = useCalcStore((s) => s.freqMHz);
  const update = useCalcStore((s) => s.update);
  const [typeId, setTypeId] = useState("custom");
  const [lengthM, setLengthM] = useState(1);

  useEffect(() => {
    if (typeId === "custom") return;
    const cable = CABLES.find((c) => c.id === typeId);
    const loss = cableLossPerM(cable, freqMHz) * lengthM;
    update({ cableLossDb: Math.round(loss * 10) / 10 });
  }, [typeId, lengthM, freqMHz, update]);

  return (
    <Card title="Kabel">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cable-type" className="text-sm text-muted">
            Jenis kabel
          </label>
          <select
            id="cable-type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
          >
            {CABLES.map((cable) => (
              <option key={cable.id} value={cable.id}>
                {cable.label}
              </option>
            ))}
          </select>
        </div>
        {typeId !== "custom" && (
          <NumberField
            label="Panjang"
            unit="m"
            value={lengthM}
            min={0}
            max={100}
            step={0.5}
            onChange={setLengthM}
          />
        )}
        <Slider
          label="Rugi kabel"
          value={cableLossDb}
          min={0}
          max={10}
          step={0.1}
          unit="dB"
          onChange={(v) => {
            setTypeId("custom");
            update({ cableLossDb: v });
          }}
        />
      </div>
    </Card>
  );
}
