import { clamp } from "./clamp";

const num = (min, max) => ({ type: "num", min, max });
const pick = (...values) => ({ type: "enum", values });

export const SHARE_SCHEMA = {
  txDbm: num(-30, 40),
  txUnit: pick("dbm", "mw"),
  gainDbi: num(0, 30),
  antCount: num(1, 12),
  cableLossDb: num(0, 10),
  sourceMode: pick("independent", "splitter"),
  phaseMode: pick("coherent", "random"),
  splitterExtraDb: num(0, 3),
  isolated: { type: "bool" },
  freqMHz: num(100, 7200),
  distanceM: num(0.5, 50000),
  obstructionDb: num(0, 40),
  rxGainDbi: num(0, 30),
  rxCableLossDb: num(0, 10),
  rxSensitivityDbm: num(-110, -40),
  fadeMarginDb: num(0, 30),
  antennaType: pick("omni", "sector", "directional"),
  sectorH: num(30, 180),
  environment: pick("free", "outdoor", "indoor"),
  wallDrywall: num(0, 20),
  wallWood: num(0, 20),
  wallGlass: num(0, 20),
  wallBrick: num(0, 20),
  wallConcrete: num(0, 20),
  bandwidthMHz: num(20, 160),
  noiseFigureDb: num(0, 30),
  region: pick("eu", "us", "id"),
  customLimit24: num(0, 60),
  customLimit5Low: num(0, 60),
  customLimit5High: num(0, 60),
};

export function sanitizeState(input) {
  const out = {};
  if (!input || typeof input !== "object") return out;

  for (const [key, rule] of Object.entries(SHARE_SCHEMA)) {
    const value = input[key];
    if (value === undefined || value === null) continue;

    if (rule.type === "num") {
      const n = Number(value);
      if (Number.isFinite(n)) out[key] = clamp(n, rule.min, rule.max);
    } else if (rule.type === "enum") {
      if (rule.values.includes(value)) out[key] = value;
    } else if (rule.type === "bool") {
      if (value === true || value === "true" || value === "1") out[key] = true;
      if (value === false || value === "false" || value === "0") out[key] = false;
    }
  }

  if (out.antCount !== undefined) out.antCount = Math.round(out.antCount);
  return out;
}

export function pickShareState(state) {
  const out = {};
  for (const key of Object.keys(SHARE_SCHEMA)) {
    if (state[key] !== undefined) out[key] = state[key];
  }
  return out;
}

export function toSearchParams(state) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(pickShareState(state))) {
    params.set(key, String(value));
  }
  return params;
}

export function fromSearchParams(search) {
  const params = new URLSearchParams(search);
  const raw = {};
  for (const key of Object.keys(SHARE_SCHEMA)) {
    if (params.has(key)) raw[key] = params.get(key);
  }
  return sanitizeState(raw);
}
