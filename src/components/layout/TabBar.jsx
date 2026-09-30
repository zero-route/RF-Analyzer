"use client";

import { useCalcStore } from "@/store/useCalcStore";

export const TABS = [
  { id: "summary", label: "Ringkasan" },
  { id: "pattern", label: "Pola" },
  { id: "link", label: "Link" },
  { id: "coverage", label: "Jangkauan" },
  { id: "safety", label: "Keamanan" },
];

export default function TabBar() {
  const active = useCalcStore((s) => s.activeTab);
  const update = useCalcStore((s) => s.update);

  return (
    <nav
      aria-label="Tampilan"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:static lg:border-0 lg:bg-transparent lg:pb-0"
    >
      <div
        role="tablist"
        className="grid grid-cols-5 lg:inline-grid lg:grid-flow-col lg:auto-cols-max lg:gap-0.5 lg:rounded-md lg:bg-sunken lg:p-0.5"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => update({ activeTab: tab.id })}
              className={`h-14 border-t-2 text-xs font-medium transition-colors lg:h-9 lg:rounded-[5px] lg:border-t-0 lg:px-4 lg:text-sm ${
                isActive
                  ? "border-accent text-ink lg:bg-surface lg:shadow-[0_0_0_1px_var(--line)]"
                  : "border-transparent text-faint hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
