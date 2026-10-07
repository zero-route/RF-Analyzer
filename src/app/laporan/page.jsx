"use client";

import { useEffect, useState } from "react";
import ReportView from "@/components/report/ReportView";
import { DEFAULTS } from "@/store/useCalcStore";
import { fromSearchParams } from "@/lib/utils/shareState";

export default function ReportPage() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "light");
    setState({ ...DEFAULTS, ...fromSearchParams(window.location.search) });
    return () => {
      if (previous) root.setAttribute("data-theme", previous);
      else root.removeAttribute("data-theme");
    };
  }, []);

  if (!state) return <main className="p-6 text-sm text-muted">Menyiapkan laporan...</main>;
  return <ReportView state={state} />;
}
