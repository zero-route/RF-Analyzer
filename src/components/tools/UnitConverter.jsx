"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { fromDbm, toDbm } from "@/lib/rf/tools";
import { dbiToDbd } from "@/lib/rf/units";

const UNITS = [
  { value: "dbm", label: "dBm" },
  { value: "mw", label: "mW" },
  { value: "w", label: "W" },
  { value: "dbw", label: "dBW" },
  { value: "dbuv", label: "dBµV" },
];

const tidy = (v) => Number(v.toPrecision(5));

export default function UnitConverter() {
  const [unit, setUnit] = useState("dbm");
  const [value, setValue] = useState(20);
  const [dbi, setDbi] = useState(2.15);

  const safeValue = (unit === "mw" || unit === "w") && value <= 0 ? 1e-6 : value;
  const out = fromDbm(toDbm(safeValue, unit));
  const rows = [
    ["dBm", tidy(out.dbm)],
    ["mW", tidy(out.mw)],
    ["W", tidy(out.w)],
    ["dBW", tidy(out.dbw)],
    ["dBµV (50 Ω)", tidy(out.dbuv)],
  ];

  return (
    <Card title="Konverter satuan">
      <div className="flex flex-col gap-4">
        <SegmentedControl options={UNITS} value={unit} onChange={setUnit} />
        <NumberField label="Nilai" value={value} step={1} onChange={setValue} />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {rows.map(([label, v]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="num text-right text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-line pt-4">
          <NumberField label="Gain antena" unit="dBi" value={dbi} step={0.1} onChange={setDbi} />
          <p className="num mt-2 text-sm text-ink">
            = {dbiToDbd(dbi).toFixed(2)} <span className="text-faint">dBd</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
