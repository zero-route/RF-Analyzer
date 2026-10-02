import { clamp } from "../utils/clamp";
import { dbmToDbuv, dbmToDbw, dbmToMw, dbmToW, mwToDbm, wToDbm } from "./units";

export function toDbm(value, unit) {
  if (unit === "mw") return mwToDbm(value);
  if (unit === "w") return wToDbm(value);
  if (unit === "dbw") return value + 30;
  if (unit === "dbuv") return value - 107;
  return value;
}

export function fromDbm(dbm) {
  return {
    dbm,
    mw: dbmToMw(dbm),
    w: dbmToW(dbm),
    dbw: dbmToDbw(dbm),
    dbuv: dbmToDbuv(dbm),
  };
}

export function gammaFromVswr(vswr) {
  return (vswr - 1) / (vswr + 1);
}

export function gammaFromReturnLoss(returnLossDb) {
  return Math.pow(10, -returnLossDb / 20);
}

export function mismatchStats(gamma) {
  const g = clamp(gamma, 0, 0.999);
  return {
    vswr: (1 + g) / (1 - g),
    returnLossDb: g === 0 ? Infinity : -20 * Math.log10(g),
    mismatchLossDb: -10 * Math.log10(1 - g * g),
    reflectedPercent: g * g * 100,
  };
}

export function noiseFloorDbm(bandwidthMHz, noiseFigureDb) {
  return -174 + 10 * Math.log10(bandwidthMHz * 1e6) + noiseFigureDb;
}
