import { computeEirp, classifyEirp } from "./eirp";
import { computeLinkBudget, maxRangeM } from "./linkBudget";
import { safeDistanceM } from "./exposure";
import { dbmToMw } from "./units";
import { pathExponent, totalObstructionDb } from "./propagation";

export function computeScenario(state) {
  const eirp = computeEirp(state);
  const status = classifyEirp(eirp.eirpDbm, state.isolated);
  const params = {
    eirpDbm: eirp.eirpDbm,
    freqMHz: state.freqMHz,
    obstructionDb: totalObstructionDb(state),
    rxGainDbi: state.rxGainDbi,
    rxCableLossDb: state.rxCableLossDb,
    fadeMarginDb: state.fadeMarginDb,
    rxSensitivityDbm: state.rxSensitivityDbm,
    pathExponent: pathExponent(state),
  };
  const link = computeLinkBudget({ ...params, distanceM: state.distanceM });

  return {
    eirpDbm: eirp.eirpDbm,
    eirpMw: dbmToMw(eirp.eirpDbm),
    status,
    rxPowerDbm: link.rxPowerDbm,
    marginDb: link.marginDb,
    rangeM: maxRangeM(params),
    safeDistanceM: safeDistanceM(eirp.eirpDbm),
    freqMHz: state.freqMHz,
    distanceM: state.distanceM,
    gainDbi: state.gainDbi,
    antCount: eirp.antCount,
  };
}
