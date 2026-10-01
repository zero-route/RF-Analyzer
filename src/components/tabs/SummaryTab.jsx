"use client";

import EirpGauge from "@/components/gauges/EirpGauge";
import PowerScale from "@/components/gauges/PowerScale";
import SignalChain from "@/components/charts/SignalChain";

export default function SummaryTab() {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <EirpGauge />
        <PowerScale />
      </div>
      <SignalChain />
    </div>
  );
}
