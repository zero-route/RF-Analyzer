export function wavelengthM(freqMHz) {
  return 299.792458 / freqMHz;
}

export function fresnelRadiusM(d1, d2, freqMHz, zone = 1) {
  const total = d1 + d2;
  if (total <= 0) return 0;
  return Math.sqrt((zone * wavelengthM(freqMHz) * d1 * d2) / total);
}

export function fresnelProfile(totalM, freqMHz, samples = 40) {
  const out = [];
  for (let i = 0; i <= samples; i += 1) {
    const d1 = (totalM * i) / samples;
    const d2 = totalM - d1;
    const r = fresnelRadiusM(d1, d2, freqMHz);
    out.push({ x: d1, radius: r, clear60: r * 0.6 });
  }
  return out;
}

export function requiredClearanceM(totalM, freqMHz) {
  return fresnelRadiusM(totalM / 2, totalM / 2, freqMHz) * 0.6;
}
