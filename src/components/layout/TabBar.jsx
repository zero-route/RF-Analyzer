"use client";

import { useCalcStore } from "@/store/useCalcStore";

export const TABS = [
  { id: "summary", label: "Ringkasan" },
  { id: "pattern", label: "Pola" },
  { id: "link", label: "Link" },
  { id: "coverage", label: "Jangkauan" },
  { id: "channel", label: "Kanal" },
  { id: "safety", label: "Keamanan" },
  { id: "compare", label: "Bandingkan" },
  { id: "tools", label: "Alat" },
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
        className="flex max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:inline-flex md:gap-0.5 md:rounded-md md:bg-sunken md:p-0.5"
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
              className={`h-14 shrink-0 border-t-2 px-4 text-xs font-medium transition-colors md:h-9 md:rounded-[5px] md:border-t-0 md:px-3.5 md:text-sm ${
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
