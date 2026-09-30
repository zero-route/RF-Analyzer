"use client";

import { useId, useState } from "react";

export default function Tooltip({ text, label = "Info" }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="grid h-5 w-5 place-items-center rounded-full border border-line text-xs text-faint hover:text-ink"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute right-0 top-7 z-20 w-56 rounded-md border border-line bg-surface p-3 text-xs leading-relaxed text-muted shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        >
          {text}
        </span>
      )}
    </span>
  );
}
