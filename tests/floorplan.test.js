import { describe, expect, it } from "vitest";
import {
  channelOverlap,
  computeClients,
  computeHeatmap,
  resolveAps,
  segmentsIntersect,
} from "../src/lib/rf/floorplan";
import { assignChannels, suggestApPositions } from "../src/lib/rf/autoPlace";

const rf = {
  eirpDbm: 20,
  freqMHz: 2400,
  rxGainDbi: 0,
  rxCableLossDb: 0,
  sensitivityDbm: -90,
  bandwidthMHz: 20,
};

describe("persimpangan garis", () => {
  it("mendeteksi garis yang bersilangan", () => {
    expect(segmentsIntersect(0, 0, 4, 4, 0, 4, 4, 0)).toBe(true);
  });

  it("mengabaikan garis sejajar dan yang tidak bertemu", () => {
    expect(segmentsIntersect(0, 0, 4, 0, 0, 1, 4, 1)).toBe(false);
    expect(segmentsIntersect(0, 0, 1, 1, 3, 3, 4, 4)).toBe(false);
  });
});

describe("peta sinyal", () => {
  it("tanpa AP tidak ada statistik", () => {
    const heat = computeHeatmap({ walls: [], aps: [], widthM: 6, heightM: 4, ...rf });
    expect(heat.stats).toBeNull();
  });

  it("satu AP di ruang kecil menjangkau seluruh area", () => {
    const aps = [{ x: 3, y: 2, rateMbps: 300, chMHz: 2437 }];
    const heat = computeHeatmap({ walls: [], aps, widthM: 6, heightM: 4, ...rf });
    expect(heat.stats.coveragePct).toBeCloseTo(100, 6);
    expect(heat.stats.interferencePct).toBe(0);
  });
});

describe("penerima dan dinding", () => {
  const aps = [{ x: 4, y: 3, rateMbps: 300, chMHz: 2437 }];
  const clients = [
    { x: 1, y: 3, kind: "laptop" },
    { x: 7, y: 3, kind: "laptop" },
  ];
  const params = { clients, aps, eirpDbm: 20, freqMHz: 2400, rxGainDbi: 0, rxCableLossDb: 0, sensitivityDbm: -90, bandwidthMHz: 20, noiseFigureDb: 6 };

  it("dinding bata mengurangi sinyal 7 dB di 2.4 GHz", () => {
    const walls = [{ x1: 5.5, y1: 0, x2: 5.5, y2: 6, type: "wallBrick" }];
    const r = computeClients({ ...params, walls });
    expect(r[0].rxDbm - r[1].rxDbm).toBeCloseTo(7, 5);
  });

  it("tanpa dinding sinyal simetris", () => {
    const r = computeClients({ ...params, walls: [] });
    expect(r[0].rxDbm).toBeCloseTo(r[1].rxDbm, 6);
  });

  it("kuota dibagi rata ke penerima di AP yang sama", () => {
    const r = computeClients({ ...params, walls: [] });
    expect(r[0].sharedBy).toBe(2);
    expect(r[0].deliveredMbps).toBeCloseTo(Math.min(300, r[0].linkMbps) / 2, 6);
  });

  it("AP kuota nol tidak memberi data", () => {
    const r = computeClients({ ...params, aps: [{ ...aps[0], rateMbps: 0 }], walls: [] });
    expect(r[0].deliveredMbps).toBe(0);
  });
});

describe("interferensi kanal", () => {
  it("menghitung tumpang tindih kanal", () => {
    expect(channelOverlap(2437, 2437, 20)).toBe(1);
    expect(channelOverlap(2412, 2437, 20)).toBe(0);
    expect(channelOverlap(2437, 2442, 20)).toBeCloseTo(0.75, 6);
  });

  it("dua AP di kanal sama lebih banyak mengganggu daripada kanal berbeda", () => {
    const make = (ch2) => [
      { x: 2, y: 2, rateMbps: 300, chMHz: 2437 },
      { x: 6, y: 2, rateMbps: 300, chMHz: ch2 },
    ];
    const same = computeHeatmap({ walls: [], aps: make(2437), widthM: 8, heightM: 4, ...rf });
    const apart = computeHeatmap({ walls: [], aps: make(2412), widthM: 8, heightM: 4, ...rf });
    expect(same.stats.interferencePct).toBeGreaterThan(apart.stats.interferencePct);
  });

  it("memberi kanal bawaan pada AP tanpa kanal", () => {
    const resolved = resolveAps([{ x: 1, y: 1 }], 2437);
    expect(resolved[0].chMHz).toBe(2437);
  });
});

describe("penempatan otomatis", () => {
  it("menaruh satu AP dekat tengah ruangan kosong", () => {
    const [p] = suggestApPositions({ walls: [], widthM: 10, heightM: 6, count: 1, ...rf });
    expect(Math.abs(p.x - 5)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(p.y - 3)).toBeLessThanOrEqual(1.5);
  });

  it("memberi dua AP berdekatan kanal berbeda", () => {
    const channels = assignChannels(
      [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      2437,
      20
    );
    expect(channels[0]).not.toBe(channels[1]);
  });
});
