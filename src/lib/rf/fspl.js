export function fsplDb(distanceM, freqMHz) {
  const d = Math.max(distanceM, 0.1);
  return 20 * Math.log10(d) + 20 * Math.log10(freqMHz) - 27.55;
}

export function distanceForLoss(lossDb, freqMHz) {
  return Math.pow(10, (lossDb - 20 * Math.log10(freqMHz) + 27.55) / 20);
}
