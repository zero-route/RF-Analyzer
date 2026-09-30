import { clamp } from "../utils/clamp";
import { dbToLinear } from "./units";

const SPHERE_DEG2 = 41253;

export function beamwidths({ type, gainDbi, sectorH = 90 }) {
  const directivity = Math.max(dbToLinear(gainDbi), 1);
  if (type === "omni") {
    const h = 360;
    const v = clamp(SPHERE_DEG2 / (directivity * h), 5, 180);
    return { h, v };
  }
  if (type === "sector") {
    const h = sectorH;
    const v = clamp(SPHERE_DEG2 / (directivity * h), 5, 180);
    return { h, v };
  }
  const side = clamp(Math.sqrt(SPHERE_DEG2 / directivity), 3, 180);
  return { h: side, v: side };
}

export function flatness(h, v) {
  const ratio = h / Math.max(v, 1);
  let label = "Bulat";
  if (ratio >= 1.5) label = "Agak pipih";
  if (ratio >= 4) label = "Pipih";
  if (ratio >= 10) label = "Sangat pipih";
  return { ratio, label };
}

export function lobeRadius(thetaDeg, bwDeg) {
  if (bwDeg >= 359.9) return 1;
  const theta = Math.abs((((thetaDeg + 180) % 360) + 360) % 360 - 180);
  if (theta > 90) return 0.03;
  const halfBw = clamp(bwDeg / 2, 1, 89.9) * (Math.PI / 180);
  const n = Math.log(0.5) / Math.log(Math.cos(halfBw));
  const r = Math.pow(Math.cos((theta * Math.PI) / 180), n);
  if (!Number.isFinite(r)) return 0.03;
  return Math.max(r, 0.03);
}

export function polarPath(bwDeg, maxR, cx, cy, step = 4) {
  let d = "";
  for (let i = 0; i <= 360; i += step) {
    const r = lobeRadius(i, bwDeg) * maxR;
    const rad = (i * Math.PI) / 180;
    const x = cx + r * Math.sin(rad);
    const y = cy - r * Math.cos(rad);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return `${d}Z`;
}

export function directionalGain(azDeg, elDeg, bw) {
  return lobeRadius(azDeg, bw.h) * lobeRadius(elDeg, bw.v);
}
