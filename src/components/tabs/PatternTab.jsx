"use client";

import PatternTypeSelector from "@/components/pattern/PatternTypeSelector";
import Pattern3D from "@/components/pattern/Pattern3D";
import PatternMetrics from "@/components/pattern/PatternMetrics";
import PolarPattern2D from "@/components/pattern/PolarPattern2D";

export default function PatternTab() {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Pattern3D />
        <PatternMetrics />
      </div>
      <div className="flex flex-col gap-4">
        <PatternTypeSelector />
        <PolarPattern2D />
      </div>
    </div>
  );
}
