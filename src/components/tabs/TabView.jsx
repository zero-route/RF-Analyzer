"use client";

import { useCalcStore } from "@/store/useCalcStore";
import SummaryTab from "./SummaryTab";
import PatternTab from "./PatternTab";
import LinkBudgetTab from "./LinkBudgetTab";
import CoverageTab from "./CoverageTab";
import FloorplanTab from "./FloorplanTab";
import ChannelTab from "./ChannelTab";
import SafetyTab from "./SafetyTab";
import CompareTab from "./CompareTab";
import ToolsTab from "./ToolsTab";

const VIEWS = {
  summary: SummaryTab,
  pattern: PatternTab,
  link: LinkBudgetTab,
  coverage: CoverageTab,
  floorplan: FloorplanTab,
  channel: ChannelTab,
  safety: SafetyTab,
  compare: CompareTab,
  tools: ToolsTab,
};

export default function TabView() {
  const active = useCalcStore((s) => s.activeTab);
  const View = VIEWS[active] ?? SummaryTab;
  return <View />;
}
