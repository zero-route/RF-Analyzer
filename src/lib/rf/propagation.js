import { fsplDb } from "./fspl";

export const ENVIRONMENTS = [
  { value: "free", label: "Ruang bebas", exponent: 2 },
  { value: "outdoor", label: "Luar ruangan", exponent: 2.7 },
  { value: "indoor", label: "Dalam ruangan", exponent: 3.2 },
];

export const WALL_TYPES = [
  { key: "wallDrywall", label: "Drywall / partisi", loss24: 3, loss5: 4 },
  { key: "wallWood", label: "Kayu / pintu", loss24: 4, loss5: 5 },
  { key: "wallGlass", label: "Kaca", loss24: 3, loss5: 5 },
  { key: "wallBrick", label: "Bata", loss24: 7, loss5: 10 },
  { key: "wallConcrete", label: "Beton", loss24: 12, loss5: 18 },
];

export function wallLossDb(state) {
  const band = state.freqMHz < 3000 ? "loss24" : "loss5";
  return WALL_TYPES.reduce((sum, wall) => sum + (state[wall.key] || 0) * wall[band], 0);
}

export function totalObstructionDb(state) {
  return state.obstructionDb + wallLossDb(state);
}

export function pathExponent(state) {
  return ENVIRONMENTS.find((e) => e.value === state.environment)?.exponent ?? 2;
}

export function pathLossDb(distanceM, freqMHz, exponent = 2) {
  const d = Math.max(distanceM, 0.1);
  return fsplDb(1, freqMHz) + 10 * exponent * Math.log10(d);
}

export function distanceForPathLoss(lossDb, freqMHz, exponent = 2) {
  return Math.pow(10, (lossDb - fsplDb(1, freqMHz)) / (10 * exponent));
}
