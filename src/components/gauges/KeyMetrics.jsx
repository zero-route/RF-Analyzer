"use client";

import { useRfModel } from "@/hooks/useRfModel";
import { formatLength } from "@/lib/utils/format";

export default function KeyMetrics() {
  const { state, eirp, status, link, range } = useRfModel();
  const ok = link.marginDb >= 0;
  const rangeValue = Number.isFinite(range) && range <= 100000 ? formatLength(range) : "> 100 km";

  const items = [
    { label: "EIRP", value: eirp.eirpDbm.toFixed(1), unit: "dBm", note: status.label },
    {
      label: "Daya terima",
      value: link.rxPowerDbm.toFixed(1),
      unit: "dBm",
      note: `pada ${formatLength(state.distanceM)}`,
    },
    {
      label: "Margin link",
      value: `${ok ? "+" : "−"}${Math.abs(link.marginDb).toFixed(1)}`,
      unit: "dB",
      note: ok ? "Memadai" : "Di bawah sensitivitas",
    },
    { label: "Jangkauan maks", value: rangeValue, unit: "", note: "arah depan" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-line bg-surface p-4">
          <p className="text-sm text-muted">{item.label}</p>
          <p className="num mt-1 text-2xl font-light tracking-tight text-ink">
            {item.value}
            {item.unit && <span className="ml-1 text-sm text-faint">{item.unit}</span>}
          </p>
          <p className="mt-1 text-xs text-faint">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
