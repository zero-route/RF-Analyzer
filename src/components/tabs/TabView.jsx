"use client";

import { useCalcStore } from "@/store/useCalcStore";
import SummaryTab from "./SummaryTab";
import PatternTab from "./PatternTab";
import LinkBudgetTab from "./LinkBudgetTab";
import CoverageTab from "./CoverageTab";
import SafetyTab from "./SafetyTab";

const VIEWS = {
  summary: SummaryTab,
  pattern: PatternTab,
  link: LinkBudgetTab,
  coverage: CoverageTab,
  safety: SafetyTab,
};

export default function TabView() {
  const active = useCalcStore((s) => s.activeTab);
  const View = VIEWS[active] ?? SummaryTab;
  return <View />;
}
