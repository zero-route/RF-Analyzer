"use client";

import CoverageMap from "@/components/coverage/CoverageMap";
import FresnelView from "@/components/coverage/FresnelView";

export default function CoverageTab() {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <CoverageMap />
      <FresnelView />
    </div>
  );
}
