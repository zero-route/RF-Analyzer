import { dbmToW } from "./units";

export const GENERAL_PUBLIC_LIMIT_WM2 = 10;

export function powerDensityWm2(eirpDbm, distanceM) {
  const d = Math.max(distanceM, 0.01);
  return dbmToW(eirpDbm) / (4 * Math.PI * d * d);
}

export function safeDistanceM(eirpDbm, limitWm2 = GENERAL_PUBLIC_LIMIT_WM2) {
  return Math.sqrt(dbmToW(eirpDbm) / (4 * Math.PI * limitWm2));
}

export function exposureRings(eirpDbm, fractions = [1, 0.5, 0.1]) {
  return fractions.map((fraction) => ({
    fraction,
    distanceM: safeDistanceM(eirpDbm, GENERAL_PUBLIC_LIMIT_WM2 * fraction),
  }));
}
