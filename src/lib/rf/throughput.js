export const REAL_FACTOR = 0.6;

const MCS = [
  { name: "BPSK 1/2", minSnr: 5, rate20: 8.6 },
  { name: "QPSK 1/2", minSnr: 8, rate20: 17.2 },
  { name: "QPSK 3/4", minSnr: 11, rate20: 25.8 },
  { name: "16-QAM 1/2", minSnr: 14, rate20: 34.4 },
  { name: "16-QAM 3/4", minSnr: 18, rate20: 51.6 },
  { name: "64-QAM 2/3", minSnr: 22, rate20: 68.8 },
  { name: "64-QAM 3/4", minSnr: 24, rate20: 77.4 },
  { name: "64-QAM 5/6", minSnr: 26, rate20: 86.0 },
  { name: "256-QAM 3/4", minSnr: 30, rate20: 103.2 },
  { name: "256-QAM 5/6", minSnr: 32, rate20: 114.7 },
  { name: "1024-QAM 3/4", minSnr: 36, rate20: 129.0 },
  { name: "1024-QAM 5/6", minSnr: 38, rate20: 143.4 },
];

const BANDWIDTH_FACTOR = { 20: 1, 40: 2, 80: 4.19, 160: 8.37 };

export function estimateRate(snrDb, bandwidthMHz, streams) {
  let best = -1;
  MCS.forEach((m, i) => {
    if (snrDb >= m.minSnr) best = i;
  });
  if (best < 0) return null;
  const mcs = MCS[best];
  const phyMbps = mcs.rate20 * (BANDWIDTH_FACTOR[bandwidthMHz] ?? 1) * streams;
  return { index: best, name: mcs.name, phyMbps, realMbps: phyMbps * REAL_FACTOR };
}

export function formatRate(mbps) {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`;
  return `${mbps.toFixed(0)} Mbps`;
}
