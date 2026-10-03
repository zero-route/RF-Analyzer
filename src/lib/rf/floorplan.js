import { fsplDb } from "./fspl";
import { WALL_TYPES } from "./propagation";

export const LEVEL_T = [0.15, 0.35, 0.55, 0.75, 0.95];
export const GOOD_DBM = -70;

export function wallLossFor(type, freqMHz) {
  const wall = WALL_TYPES.find((w) => w.key === type);
  if (!wall) return 0;
  return freqMHz < 3000 ? wall.loss24 : wall.loss5;
}

export function legendItems(sensitivityDbm) {
  return [
    { level: 4, label: "≥ −50 dBm" },
    { level: 3, label: "−50 sampai −60" },
    { level: 2, label: "−60 sampai −70" },
    { level: 1, label: "−70 sampai −80" },
    { level: 0, label: `−80 sampai ${sensitivityDbm}` },
  ];
}

function cross(ax, ay, bx, by, cx, cy) {
  return (cy - ay) * (bx - ax) - (by - ay) * (cx - ax);
}

export function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = cross(ax, ay, bx, by, cx, cy);
  const d2 = cross(ax, ay, bx, by, dx, dy);
  const d3 = cross(cx, cy, dx, dy, ax, ay);
  const d4 = cross(cx, cy, dx, dy, bx, by);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function levelOf(rx, sensitivityDbm) {
  if (rx >= -50) return 4;
  if (rx >= -60) return 3;
  if (rx >= -70) return 2;
  if (rx >= -80) return 1;
  if (rx >= sensitivityDbm) return 0;
  return -1;
}

export function computeHeatmap({
  walls,
  aps,
  widthM,
  heightM,
  eirpDbm,
  freqMHz,
  rxGainDbi,
  rxCableLossDb,
  sensitivityDbm,
}) {
  const cell = (widthM * heightM) / 0.25 > 6000 ? 1 : 0.5;
  const cols = Math.ceil(widthM / cell);
  const rows = Math.ceil(heightM / cell);
  const levels = new Int8Array(cols * rows).fill(-1);

  if (aps.length === 0) return { cols, rows, cell, levels, stats: null };

  const losses = walls.map((w) => wallLossFor(w.type, freqMHz));
  const offset = eirpDbm + rxGainDbi - rxCableLossDb;
  let covered = 0;
  let good = 0;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const px = (c + 0.5) * cell;
      const py = (r + 0.5) * cell;
      let best = -Infinity;

      for (const ap of aps) {
        const d = Math.max(Math.hypot(px - ap.x, py - ap.y), 0.5);
        let loss = fsplDb(d, freqMHz);
        for (let i = 0; i < walls.length; i += 1) {
          const w = walls[i];
          if (segmentsIntersect(ap.x, ap.y, px, py, w.x1, w.y1, w.x2, w.y2)) loss += losses[i];
        }
        const rx = offset - loss;
        if (rx > best) best = rx;
      }

      const level = levelOf(best, sensitivityDbm);
      levels[r * cols + c] = level;
      if (level >= 0) covered += 1;
      if (best >= GOOD_DBM) good += 1;
    }
  }

  const total = cols * rows;
  return {
    cols,
    rows,
    cell,
    levels,
    stats: { coveragePct: (covered / total) * 100, goodPct: (good / total) * 100 },
  };
}
