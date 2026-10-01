import { useCalcStore } from "@/store/useCalcStore";
import { computeEirp, classifyEirp } from "@/lib/rf/eirp";
import { computeLinkBudget, maxRangeM } from "@/lib/rf/linkBudget";

export function useRfModel() {
  const state = useCalcStore();
  const eirp = computeEirp(state);
  const status = classifyEirp(eirp.eirpDbm, state.isolated);
  const linkParams = {
    eirpDbm: eirp.eirpDbm,
    freqMHz: state.freqMHz,
    obstructionDb: state.obstructionDb,
    rxGainDbi: state.rxGainDbi,
    rxCableLossDb: state.rxCableLossDb,
    fadeMarginDb: state.fadeMarginDb,
    rxSensitivityDbm: state.rxSensitivityDbm,
  };
  const link = computeLinkBudget({ ...linkParams, distanceM: state.distanceM });
  const range = maxRangeM(linkParams);
  return { state, eirp, status, link, linkParams, range };
}
