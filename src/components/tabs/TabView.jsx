"use client";

import Card from "@/components/ui/Card";
import { useCalcStore } from "@/store/useCalcStore";
import SummaryTab from "./SummaryTab";
import LinkBudgetTab from "./LinkBudgetTab";

const VIEWS = {
  summary: SummaryTab,
  link: LinkBudgetTab,
};

export default function TabView() {
  const active = useCalcStore((s) => s.activeTab);
  const View = VIEWS[active];

  if (!View) {
    return (
      <Card title="Segera hadir">
        <p className="text-sm text-muted">Tampilan ini sedang disiapkan.</p>
      </Card>
    );
  }

  return <View />;
}
