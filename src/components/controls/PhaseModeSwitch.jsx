"use client";

import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useCalcStore } from "@/store/useCalcStore";

const MODES = [
  { value: "coherent", label: "Sefase" },
  { value: "random", label: "Acak" },
];

export default function PhaseModeSwitch() {
  const phaseMode = useCalcStore((s) => s.phaseMode);
  const antCount = useCalcStore((s) => s.antCount);
  const update = useCalcStore((s) => s.update);

  if (antCount < 2) return null;

  return (
    <Card title="Fase antar antena">
      <SegmentedControl options={MODES} value={phaseMode} onChange={(v) => update({ phaseMode: v })} />
    </Card>
  );
}
