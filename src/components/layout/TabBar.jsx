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
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:static md:border-0 md:bg-transparent md:pb-0"
    >
      <div
        role="tablist"
        className="grid grid-cols-5 md:inline-grid md:grid-flow-col md:auto-cols-max md:gap-0.5 md:rounded-md md:bg-sunken md:p-0.5"
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
              className={`h-14 border-t-2 text-xs font-medium transition-colors md:h-9 md:rounded-[5px] md:border-t-0 md:px-4 md:text-sm ${
                isActive
                  ? "border-accent text-ink md:bg-surface md:shadow-[0_0_0_1px_var(--line)]"
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
