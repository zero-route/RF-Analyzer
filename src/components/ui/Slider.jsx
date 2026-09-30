"use client";

import { useId } from "react";

export default function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  digits = 1,
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-muted">
          {label}
        </label>
        <span className="num text-sm font-medium text-ink">
          {Number(value).toFixed(digits)}
          {unit && <span className="ml-1 font-normal text-faint">{unit}</span>}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
