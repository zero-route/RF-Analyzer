"use client";

import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "@/components/ui/Card";
import { useRfModel } from "@/hooks/useRfModel";
import { rxCurve } from "@/lib/rf/linkBudget";
import { clamp } from "@/lib/utils/clamp";
import { formatDistance } from "@/lib/utils/format";

export default function RxVsDistance() {
  const { state, linkParams, range } = useRfModel();
  const finiteRange = Number.isFinite(range) ? range : 1000;
  const maxDist = clamp(Math.max(finiteRange * 1.3, state.distanceM * 1.2), 10, 50000);
  const data = rxCurve(linkParams, maxDist, 80);
  const high = Math.ceil(Math.max(...data.map((d) => d.rx)) / 10) * 10;
  const low = Math.floor((Math.min(state.rxSensitivityDbm, data[data.length - 1].rx) - 5) / 10) * 10;

  return (
    <Card title="Daya terima terhadap jarak">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              dataKey="distance"
              domain={[0, maxDist]}
              tickFormatter={(v) => formatDistance(v)}
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              axisLine={{ stroke: "var(--line)" }}
              tickLine={false}
              tickCount={4}
            />
            <YAxis
              domain={[low, high]}
              width={38}
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [`${Number(v).toFixed(1)} dBm`, "Daya terima"]}
              labelFormatter={(v) => formatDistance(Number(v))}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--ink)",
              }}
            />
            <ReferenceLine
              y={state.rxSensitivityDbm + state.fadeMarginDb}
              stroke="var(--faint)"
              strokeDasharray="4 4"
              label={{ value: "Sensitivitas + fade", position: "insideTopRight", fill: "var(--faint)", fontSize: 10 }}
            />
            <ReferenceLine x={state.distanceM} stroke="var(--ink)" strokeWidth={1} />
            <Line type="monotone" dataKey="rx" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
