export const CABLES = [
  { id: "custom", label: "Input manual", perM: null },
  { id: "rg174", label: "RG-174", perM: { 2400: 1.6, 5800: 2.6 } },
  { id: "rg58", label: "RG-58", perM: { 2400: 0.8, 5800: 1.3 } },
  { id: "lmr240", label: "LMR-240", perM: { 2400: 0.35, 5800: 0.56 } },
  { id: "lmr400", label: "LMR-400", perM: { 2400: 0.22, 5800: 0.35 } },
];

export function cableLossPerM(cable, freqMHz) {
  if (!cable || !cable.perM) return 0;
  const lo = cable.perM[2400];
  const hi = cable.perM[5800];
  const t = Math.min(Math.max((freqMHz - 2400) / (5800 - 2400), 0), 1.5);
  return lo + (hi - lo) * t;
}
