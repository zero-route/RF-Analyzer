import { useCalcStore } from "@/store/useCalcStore";
import { computeEirp, classifyEirp } from "@/lib/rf/eirp";
import { computeLinkBudget, maxRangeM } from "@/lib/rf/linkBudget";
import { pathExponent, totalObstructionDb } from "@/lib/rf/propagation";

export function useRfModel() {
  const state = useCalcStore();
  const eirp = computeEirp(state);
  const status = classifyEirp(eirp.eirpDbm, state.isolated);
  const obstructionDb = totalObstructionDb(state);
  const exponent = pathExponent(state);
  const linkParams = {
    eirpDbm: eirp.eirpDbm,
    freqMHz: state.freqMHz,
    obstructionDb,
    rxGainDbi: state.rxGainDbi,
    rxCableLossDb: state.rxCableLossDb,
    fadeMarginDb: state.fadeMarginDb,
    rxSensitivityDbm: state.rxSensitivityDbm,
    pathExponent: exponent,
  };
  const link = computeLinkBudget({ ...linkParams, distanceM: state.distanceM });
  const range = maxRangeM(linkParams);
  return { state, eirp, status, link, linkParams, range, obstructionDb, pathExponent: exponent };
}
