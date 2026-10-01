"use client";

import EirpGauge from "@/components/gauges/EirpGauge";
import PowerScale from "@/components/gauges/PowerScale";
import SignalChain from "@/components/charts/SignalChain";

export default function SummaryTab() {
  return (
    <>
      <EirpGauge />
      <PowerScale />
      <SignalChain />
    </>
  );
}
