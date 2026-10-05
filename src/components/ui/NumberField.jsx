"use client";

import { useId, useState } from "react";
import { clamp } from "@/lib/utils/clamp";
import InfoTip from "./InfoTip";

export default function NumberField({
  label,
  tip,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit = "",
}) {
  const id = useId();
  const [draft, setDraft] = useState(null);

  function handleChange(e) {
    const raw = e.target.value;
    setDraft(raw);
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed)) onChange(clamp(parsed, min, max));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-sm text-muted">
          {label}
        </label>
        {tip && <InfoTip term={tip} />}
      </span>
      <div className="flex h-10 items-center rounded-md border border-line bg-surface px-3 focus-within:border-accent">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={Number.isFinite(min) ? min : undefined}
          max={Number.isFinite(max) ? max : undefined}
          value={draft ?? String(value)}
          onChange={handleChange}
          onBlur={() => setDraft(null)}
          className="num w-full min-w-0 bg-transparent text-sm text-ink outline-none"
        />
        {unit && <span className="ml-2 shrink-0 whitespace-nowrap text-sm text-faint">{unit}</span>}
      </div>
    </div>
  );
}
