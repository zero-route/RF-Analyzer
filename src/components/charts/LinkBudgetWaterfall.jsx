"use client";

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import Card from "@/components/ui/Card";
import { useRfModel } from "@/hooks/useRfModel";

const SHORT = {
  fspl: "FSPL",
  obstruction: "Halangan",
  rxGain: "Gain RX",
  rxCable: "Kabel RX",
};

const FILLS = {
  total: "var(--accent)",
  gain: "var(--muted)",
  loss: "var(--line)",
};

function buildRows(link, floor) {
  const rows = [];
  link.steps.forEach((step, i) => {
    if (step.key === "eirp") {
      rows.push({ name: "EIRP", range: [floor, step.level], text: step.level.toFixed(1), kind: "total" });
      return;
    }
    if (step.delta === 0) return;
    const prev = link.steps[i - 1].level;
    rows.push({
      name: SHORT[step.key],
      range: [Math.min(prev, step.level), Math.max(prev, step.level)],
      text: `${step.delta > 0 ? "+" : "−"}${Math.abs(step.delta).toFixed(1)}`,
      kind: step.delta > 0 ? "gain" : "loss",
    });
  });
  rows.push({ name: "RX", range: [floor, link.rxPowerDbm], text: link.rxPowerDbm.toFixed(1), kind: "total" });
  return rows;
}

export default function LinkBudgetWaterfall() {
  const { state, eirp, link } = useRfModel();
  const floor = Math.floor((Math.min(link.rxPowerDbm, state.rxSensitivityDbm) - 10) / 10) * 10;
  const top = Math.ceil((eirp.eirpDbm + 10) / 10) * 10;
  const rows = buildRows(link, floor);

  return (
    <Card title="Anggaran link (dBm)" tip="linkbudget">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 18, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              axisLine={{ stroke: "var(--line)" }}
              tickLine={false}
            />
            <YAxis
              domain={[floor, top]}
              width={38}
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              y={state.rxSensitivityDbm}
              stroke="var(--faint)"
              strokeDasharray="4 4"
              label={{ value: "Sensitivitas", position: "insideTopRight", fill: "var(--faint)", fontSize: 10 }}
            />
            <Bar dataKey="range" radius={2} isAnimationActive={false}>
              {rows.map((row) => (
                <Cell key={row.name} fill={FILLS[row.kind]} stroke={row.kind === "loss" ? "var(--faint)" : "none"} />
              ))}
              <LabelList dataKey="text" position="top" fill="var(--muted)" fontSize={11} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
