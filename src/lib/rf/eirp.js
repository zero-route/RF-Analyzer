import { linearToDb } from "./units";
import { clamp } from "../utils/clamp";

export function computeEirp({
  txDbm,
  gainDbi,
  cableLossDb,
  antCount,
  sourceMode,
  phaseMode,
  splitterExtraDb,
}) {
  const count = clamp(Math.round(antCount || 1), 1, 12);
  const idealSplitLossDb = linearToDb(count);
  const totalSplitLossDb = idealSplitLossDb + splitterExtraDb;
  const perAntennaDbm = sourceMode === "splitter" ? txDbm - totalSplitLossDb : txDbm;
  const eirpSingleDbm = perAntennaDbm + gainDbi - cableLossDb;
  const arrayGainDb = phaseMode === "coherent" ? idealSplitLossDb : 0;
  const eirpDbm = eirpSingleDbm + arrayGainDb;

  return {
    antCount: count,
    idealSplitLossDb,
    totalSplitLossDb,
    perAntennaDbm,
    eirpSingleDbm,
    arrayGainDb,
    eirpDbm,
  };
}

export function classifyEirp(eirpDbm, isolated) {
  if (isolated) return { level: "isolated", label: "Aman (terisolasi)" };
  if (eirpDbm <= 20) return { level: "safe", label: "Aman" };
  if (eirpDbm <= 30) return { level: "permit", label: "Perlu izin" };
  return { level: "danger", label: "Bahaya" };
}
