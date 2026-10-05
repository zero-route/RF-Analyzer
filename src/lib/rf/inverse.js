import { computeEirp } from "./eirp";
import { pathExponent, pathLossDb, totalObstructionDb } from "./propagation";

export function requiredTxDbm(targetEirpDbm, state) {
  return targetEirpDbm - computeEirp({ ...state, txDbm: 0 }).eirpDbm;
}

export function requiredGainDbi(targetEirpDbm, state) {
  return targetEirpDbm - computeEirp({ ...state, gainDbi: 0 }).eirpDbm;
}

export function requiredEirpForRange(distanceM, state) {
  const requiredRx = state.rxSensitivityDbm + state.fadeMarginDb;
  return (
    requiredRx +
    pathLossDb(distanceM, state.freqMHz, pathExponent(state)) +
    totalObstructionDb(state) -
    state.rxGainDbi +
    state.rxCableLossDb
  );
}
