"use client";

import ExposureRings from "@/components/safety/ExposureRings";
import RegulationCard from "@/components/safety/RegulationCard";

export default function SafetyTab() {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <ExposureRings />
      <RegulationCard />
    </div>
  );
}
