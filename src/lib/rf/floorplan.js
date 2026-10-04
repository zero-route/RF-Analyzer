import { fsplDb } from "./fspl";
import { WALL_TYPES } from "./propagation";

export const LEVEL_COLORS = ["rgba(225, 40, 30, 0.72)", "rgba(250, 200, 20, 0.72)", "rgba(30, 90, 255, 0.72)"];
export const STRONG_DBM = -60;
export const MEDIUM_DBM = -75;

export function wallLossFor(type, freqMHz) {
  const wall = WALL_TYPES.find((w) => w.key === type);
  if (!wall) return 0;
  return freqMHz < 3000 ? wall.loss24 : wall.loss5;
}

export function legendItems(sensitivityDbm) {
  return [
    { level: 2, label: "Kuat, dekat AP (≥ −60 dBm)" },
    { level: 1, label: "Menengah (−60 sampai −75)" },
    { level: 0, label: `Lemah, jauh (−75 sampai ${sensitivityDbm})` },
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
  if (rx < sensitivityDbm) return -1;
  if (rx >= STRONG_DBM) return 2;
  if (rx >= MEDIUM_DBM) return 1;
  return 0;
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
      if (best >= STRONG_DBM) good += 1;
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
