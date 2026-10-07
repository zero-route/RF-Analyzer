"use client";

import CoverageMap from "@/components/coverage/CoverageMap";
import FresnelView from "@/components/coverage/FresnelView";
import TowerHeight from "@/components/coverage/TowerHeight";

export default function CoverageTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 md:grid-cols-2">
        <CoverageMap />
        <FresnelView />
      </div>
      <TowerHeight />
    </div>
  );
}
