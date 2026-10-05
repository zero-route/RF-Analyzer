"use client";

import UnitConverter from "@/components/tools/UnitConverter";
import MismatchCalculator from "@/components/tools/MismatchCalculator";
import NoiseSnr from "@/components/tools/NoiseSnr";
import SpeedEstimate from "@/components/tools/SpeedEstimate";
import InverseCalculator from "@/components/tools/InverseCalculator";
import GlossaryCard from "@/components/tools/GlossaryCard";

export default function ToolsTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <InverseCalculator />
          <UnitConverter />
          <MismatchCalculator />
        </div>
        <div className="flex flex-col gap-4">
          <NoiseSnr />
          <SpeedEstimate />
          <GlossaryCard />
        </div>
      </div>
    </div>
  );
}
