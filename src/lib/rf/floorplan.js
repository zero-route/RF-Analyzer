import { fsplDb } from "./fspl";
import { WALL_TYPES } from "./propagation";
import { noiseFloorDbm } from "./tools";
import { estimateRate } from "./throughput";
import { bandForFreq, buildChannels } from "../data/channels";

export const LEVEL_COLORS = ["rgba(225, 40, 30, 0.72)", "rgba(250, 200, 20, 0.72)", "rgba(30, 90, 255, 0.72)"];
export const DEFAULT_AP_RATE = 300;
export const CLIENT_KINDS = [
  { id: "hp", label: "HP", streams: 1 },
  { id: "laptop", label: "Laptop", streams: 2 },
  { id: "pc", label: "PC", streams: 2 },
];
export const STRONG_DBM = -60;
export const MEDIUM_DBM = -75;
const INTERFERENCE_MARGIN_DB = 10;

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

export function channelOverlap(a, b, widthMHz) {
  return Math.max(0, 1 - Math.abs(a - b) / Math.max(widthMHz, 1));
}

function isActive(ap) {
  return (ap.rateMbps ?? DEFAULT_AP_RATE) > 0;
}

export function resolveAps(aps, freqMHz) {
  const channels = buildChannels(bandForFreq(freqMHz), 20);
  let fallback = channels[0]?.centerMHz ?? freqMHz;
  for (const c of channels) {
    if (Math.abs(c.centerMHz - freqMHz) < Math.abs(fallback - freqMHz)) fallback = c.centerMHz;
  }
  return aps.map((ap) => ({ ...ap, chMHz: ap.chMHz ?? fallback }));
}

function signalsAt(aps, px, py, walls, losses, freqMHz, offset) {
  return aps.map((ap) => {
    const d = Math.max(Math.hypot(px - ap.x, py - ap.y), 0.5);
    let loss = fsplDb(d, freqMHz);
    for (let i = 0; i < walls.length; i += 1) {
      const w = walls[i];
      if (segmentsIntersect(ap.x, ap.y, px, py, w.x1, w.y1, w.x2, w.y2)) loss += losses[i];
    }
    return offset - loss;
  });
}

function strongest(values) {
  let best = -Infinity;
  let index = -1;
  values.forEach((v, i) => {
    if (v > best) {
      best = v;
      index = i;
    }
  });
  return { best, index };
}

function interferenceFor(aps, rxs, servingIndex, bandwidthMHz) {
  let intf = -Infinity;
  for (let j = 0; j < aps.length; j += 1) {
    if (j === servingIndex || !isActive(aps[j])) continue;
    const overlap = channelOverlap(aps[servingIndex].chMHz, aps[j].chMHz, bandwidthMHz);
    if (overlap <= 0) continue;
    const effective = rxs[j] + 10 * Math.log10(overlap);
    if (effective > intf) intf = effective;
  }
  return intf;
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
  bandwidthMHz = 20,
}) {
  const cell = (widthM * heightM) / 0.25 > 6000 ? 1 : 0.5;
  const cols = Math.ceil(widthM / cell);
  const rows = Math.ceil(heightM / cell);
  const levels = new Int8Array(cols * rows).fill(-1);
  const interference = new Uint8Array(cols * rows);

  if (aps.length === 0) return { cols, rows, cell, levels, interference, stats: null };

  const losses = walls.map((w) => wallLossFor(w.type, freqMHz));
  const offset = eirpDbm + rxGainDbi - rxCableLossDb;
  let covered = 0;
  let good = 0;
  let disturbed = 0;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const rxs = signalsAt(aps, (c + 0.5) * cell, (r + 0.5) * cell, walls, losses, freqMHz, offset);
      const { best, index } = strongest(rxs);
      const level = levelOf(best, sensitivityDbm);
      levels[r * cols + c] = level;
      if (level >= 0) covered += 1;
      if (best >= STRONG_DBM) good += 1;

      if (level >= 0 && aps.length > 1) {
        const intf = interferenceFor(aps, rxs, index, bandwidthMHz);
        if (intf >= sensitivityDbm && best - intf < INTERFERENCE_MARGIN_DB) {
          interference[r * cols + c] = 1;
          disturbed += 1;
        }
      }
    }
  }

  const total = cols * rows;
  return {
    cols,
    rows,
    cell,
    levels,
    interference,
    stats: {
      coveragePct: (covered / total) * 100,
      goodPct: (good / total) * 100,
      interferencePct: (disturbed / total) * 100,
    },
  };
}

export function clientLabel(clients, index) {
  const kind = clients[index].kind;
  const label = (CLIENT_KINDS.find((k) => k.id === kind) ?? CLIENT_KINDS[0]).label;
  const order = clients.slice(0, index + 1).filter((c) => c.kind === kind).length;
  return `${label}${order}`;
}

export function computeClients({
  clients,
  aps,
  walls,
  eirpDbm,
  freqMHz,
  rxGainDbi,
  rxCableLossDb,
  sensitivityDbm,
  bandwidthMHz,
  noiseFigureDb,
}) {
  const losses = walls.map((w) => wallLossFor(w.type, freqMHz));
  const floor = noiseFloorDbm(bandwidthMHz, noiseFigureDb);
  const offset = eirpDbm + rxGainDbi - rxCableLossDb;

  const links = clients.map((client) => {
    const rxs = signalsAt(aps, client.x, client.y, walls, losses, freqMHz, offset);
    const { best, index } = strongest(rxs);
    const kind = CLIENT_KINDS.find((k) => k.id === client.kind) ?? CLIENT_KINDS[0];
    let snrDb = best - floor;
    if (index >= 0) {
      const intf = interferenceFor(aps, rxs, index, bandwidthMHz);
      if (Number.isFinite(intf)) {
        const noiseMw = Math.pow(10, floor / 10) + Math.pow(10, intf / 10);
        snrDb = best - 10 * Math.log10(noiseMw);
      }
    }
    const rate = index >= 0 && best >= sensitivityDbm ? estimateRate(snrDb, bandwidthMHz, kind.streams) : null;
    return { apIndex: index, rxDbm: best, snrDb, rate };
  });

  const counts = aps.map(() => 0);
  links.forEach((l) => {
    if (l.rate) counts[l.apIndex] += 1;
  });

  return links.map((l) => {
    if (!l.rate) {
      return {
        connected: false,
        apIndex: l.apIndex,
        rxDbm: l.rxDbm,
        snrDb: l.snrDb,
        linkMbps: 0,
        deliveredMbps: 0,
        deliveryPct: 0,
        mcsName: null,
        sharedBy: 0,
      };
    }
    const offered = aps[l.apIndex].rateMbps ?? DEFAULT_AP_RATE;
    const sharedBy = counts[l.apIndex];
    return {
      connected: true,
      apIndex: l.apIndex,
      rxDbm: l.rxDbm,
      snrDb: l.snrDb,
      mcsName: l.rate.name,
      linkMbps: l.rate.realMbps,
      deliveredMbps: Math.min(offered, l.rate.realMbps) / sharedBy,
      deliveryPct: offered > 0 ? Math.min(1, l.rate.realMbps / offered) * 100 : null,
      sharedBy,
    };
  });
}
