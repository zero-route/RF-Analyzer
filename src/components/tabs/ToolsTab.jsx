"use client";

import UnitConverter from "@/components/tools/UnitConverter";
import MismatchCalculator from "@/components/tools/MismatchCalculator";
import NoiseSnr from "@/components/tools/NoiseSnr";

export default function ToolsTab() {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <UnitConverter />
        <NoiseSnr />
      </div>
      <MismatchCalculator />
    </div>
  );
}
