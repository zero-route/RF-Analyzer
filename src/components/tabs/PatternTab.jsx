"use client";

import PatternTypeSelector from "@/components/pattern/PatternTypeSelector";
import Pattern3D from "@/components/pattern/Pattern3D";
import PatternMetrics from "@/components/pattern/PatternMetrics";
import PolarPattern2D from "@/components/pattern/PolarPattern2D";

export default function PatternTab() {
  return (
    <>
      <PatternTypeSelector />
      <Pattern3D />
      <PatternMetrics />
      <PolarPattern2D />
    </>
  );
}
