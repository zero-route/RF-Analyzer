"use client";

import Card from "@/components/ui/Card";
import { useRfModel } from "@/hooks/useRfModel";

function formatDelta(delta) {
  if (delta === null) return "";
  return `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} dB`;
}

export default function SignalChain() {
  const { state: s, eirp, link, obstructionDb } = useRfModel();
  const rows = [];
  let level = s.txDbm;

  rows.push({ label: "Daya TX", delta: null, level });
  if (s.sourceMode === "splitter" && eirp.antCount > 1) {
    level -= eirp.totalSplitLossDb;
    rows.push({ label: `Splitter 1:${eirp.antCount}`, delta: -eirp.totalSplitLossDb, level });
  }
  if (s.cableLossDb > 0) {
    level -= s.cableLossDb;
    rows.push({ label: "Kabel TX", delta: -s.cableLossDb, level });
  }
  level += s.gainDbi;
  rows.push({ label: "Gain antena", delta: s.gainDbi, level });
  if (eirp.arrayGainDb > 0) {
    level += eirp.arrayGainDb;
    rows.push({ label: "Gain susunan", delta: eirp.arrayGainDb, level });
  }
  rows.push({ label: "EIRP", delta: null, level: eirp.eirpDbm, strong: true });

  level = eirp.eirpDbm - link.pathLossDb;
  rows.push({ label: "Rugi lintasan", delta: -link.pathLossDb, level });
  if (obstructionDb > 0) {
    level -= obstructionDb;
    rows.push({ label: "Halangan", delta: -obstructionDb, level });
  }
  level += s.rxGainDbi;
  rows.push({ label: "Gain antena RX", delta: s.rxGainDbi, level });
  if (s.rxCableLossDb > 0) {
    level -= s.rxCableLossDb;
    rows.push({ label: "Kabel RX", delta: -s.rxCableLossDb, level });
  }
  rows.push({ label: "Daya terima", delta: null, level: link.rxPowerDbm, strong: true });

  return (
    <Card title="Rantai sinyal" tip="linkbudget">
      <ul>
        {rows.map((row, i) => (
          <li
            key={`${row.label}-${i}`}
            className={`grid grid-cols-[1fr_auto_5.5rem] items-baseline gap-3 border-b border-line py-2 last:border-b-0 ${
              row.strong ? "font-medium text-ink" : "text-muted"
            }`}
          >
            <span className="text-sm">{row.label}</span>
            <span className="num text-xs text-faint">{formatDelta(row.delta)}</span>
            <span className="num text-right text-sm text-ink">{row.level.toFixed(1)} dBm</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
