import { fsplDb } from "./fspl";
import { STRONG_DBM, channelOverlap, segmentsIntersect, wallLossFor } from "./floorplan";
import { bandForFreq, buildChannels } from "../data/channels";

export function suggestApPositions({
  walls,
  widthM,
  heightM,
  count,
  eirpDbm,
  freqMHz,
  rxGainDbi,
  rxCableLossDb,
  sensitivityDbm,
}) {
  const evalCell = Math.max(0.5, Math.ceil(Math.sqrt((widthM * heightM) / 1200) * 2) / 2);
  const cols = Math.ceil(widthM / evalCell);
  const rows = Math.ceil(heightM / evalCell);
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) cells.push([(c + 0.5) * evalCell, (r + 0.5) * evalCell]);
  }

  const step = Math.max(1, Math.ceil(Math.max(widthM, heightM) / 16));
  const candidates = [];
  for (let y = step / 2; y < heightM; y += step) {
    for (let x = step / 2; x < widthM; x += step) candidates.push([x, y]);
  }

  const losses = walls.map((w) => wallLossFor(w.type, freqMHz));
  const offset = eirpDbm + rxGainDbi - rxCableLossDb;
  const span = Math.max(STRONG_DBM - sensitivityDbm, 1);
  const utility = (rx) => (rx < sensitivityDbm ? 0 : Math.min(1, (rx - sensitivityDbm) / span));

  const signals = candidates.map(([cx, cy]) => {
    const arr = new Float32Array(cells.length);
    cells.forEach(([px, py], i) => {
      const d = Math.max(Math.hypot(px - cx, py - cy), 0.5);
      let loss = fsplDb(d, freqMHz);
      for (let k = 0; k < walls.length; k += 1) {
        const w = walls[k];
        if (segmentsIntersect(cx, cy, px, py, w.x1, w.y1, w.x2, w.y2)) loss += losses[k];
      }
      arr[i] = offset - loss;
    });
    return arr;
  });

  const best = new Float32Array(cells.length).fill(-1000);
  const used = new Set();
  const chosen = [];
  const total = Math.max(1, Math.min(count, candidates.length));

  for (let n = 0; n < total; n += 1) {
    let bestIndex = -1;
    let bestScore = -1;
    signals.forEach((arr, idx) => {
      if (used.has(idx)) return;
      let score = 0;
      for (let i = 0; i < arr.length; i += 1) score += utility(Math.max(best[i], arr[i]));
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    });
    used.add(bestIndex);
    chosen.push(candidates[bestIndex]);
    const arr = signals[bestIndex];
    for (let i = 0; i < arr.length; i += 1) if (arr[i] > best[i]) best[i] = arr[i];
  }

  return chosen.map(([x, y]) => ({ x, y }));
}

export function assignChannels(aps, freqMHz, bandwidthMHz = 20) {
  const pool = buildChannels(bandForFreq(freqMHz), 20)
    .filter((c) => c.clear)
    .map((c) => c.centerMHz);
  const out = [];

  aps.forEach((ap, i) => {
    let pick = pool[0];
    let lowest = Infinity;
    pool.forEach((center) => {
      let cost = 0;
      for (let j = 0; j < i; j += 1) {
        const d = Math.hypot(ap.x - aps[j].x, ap.y - aps[j].y);
        cost += channelOverlap(center, out[j], bandwidthMHz) / (1 + d);
      }
      if (cost < lowest - 1e-9) {
        lowest = cost;
        pick = center;
      }
    });
    out.push(pick);
  });

  return out;
}
