import { clamp } from "../utils/clamp";
import { fresnelRadiusM } from "./fresnel";

export const STANDARD_K = 4 / 3;

export function earthBulgeM(d1M, d2M, k = STANDARD_K) {
  return ((d1M / 1000) * (d2M / 1000)) / (12.74 * k);
}

export function radioHorizonKm(h1M, h2M, k = STANDARD_K) {
  return 3.57 * Math.sqrt(k) * (Math.sqrt(Math.max(h1M, 0)) + Math.sqrt(Math.max(h2M, 0)));
}

export function clearanceRequiredM(d1M, d2M, freqMHz, k = STANDARD_K, obstacleHeightM = 0) {
  return obstacleHeightM + earthBulgeM(d1M, d2M, k) + 0.6 * fresnelRadiusM(d1M, d2M, freqMHz);
}

export function requiredTowerHeights({
  distanceM,
  freqMHz,
  k = STANDARD_K,
  rxHeightM,
  obstacleHeightM = 0,
  obstaclePos = 0.5,
}) {
  const points = [{ p: 0.5, obstacle: 0 }];
  if (obstacleHeightM > 0) points.push({ p: clamp(obstaclePos, 0.05, 0.95), obstacle: obstacleHeightM });

  let equalHeightM = 0;
  let txHeightM = 0;
  for (const { p, obstacle } of points) {
    const need = clearanceRequiredM(distanceM * p, distanceM * (1 - p), freqMHz, k, obstacle);
    equalHeightM = Math.max(equalHeightM, need);
    txHeightM = Math.max(txHeightM, (need - rxHeightM * p) / (1 - p));
  }

  return {
    equalHeightM,
    txHeightM: Math.max(txHeightM, 0),
    bulgeMidM: earthBulgeM(distanceM / 2, distanceM / 2, k),
    fresnelMidM: 0.6 * fresnelRadiusM(distanceM / 2, distanceM / 2, freqMHz),
    horizonKm: radioHorizonKm(equalHeightM, equalHeightM, k),
  };
}
