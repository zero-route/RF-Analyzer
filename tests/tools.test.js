import { describe, expect, it } from "vitest";
import { gammaFromReturnLoss, gammaFromVswr, mismatchStats, noiseFloorDbm } from "../src/lib/rf/tools";
import { powerDensityWm2, safeDistanceM } from "../src/lib/rf/exposure";
import { fresnelRadiusM, requiredClearanceM } from "../src/lib/rf/fresnel";
import { estimateRate } from "../src/lib/rf/throughput";

describe("VSWR dan mismatch", () => {
  it("menghitung VSWR 1.5", () => {
    const g = gammaFromVswr(1.5);
    expect(g).toBeCloseTo(0.2, 6);
    const s = mismatchStats(g);
    expect(s.returnLossDb).toBeCloseTo(13.979, 2);
    expect(s.mismatchLossDb).toBeCloseTo(0.1773, 3);
    expect(s.reflectedPercent).toBeCloseTo(4, 6);
  });

  it("konsisten antara return loss dan VSWR", () => {
    const s = mismatchStats(gammaFromReturnLoss(20));
    expect(s.vswr).toBeCloseTo(1.222, 2);
  });

  it("match sempurna tidak memantulkan daya", () => {
    const s = mismatchStats(0);
    expect(s.returnLossDb).toBe(Infinity);
    expect(s.mismatchLossDb).toBeCloseTo(0, 9);
  });
});

describe("noise floor", () => {
  it("menghitung termal 20 MHz tanpa noise figure", () => {
    expect(noiseFloorDbm(20, 0)).toBeCloseTo(-100.99, 1);
  });

  it("menambah noise figure", () => {
    expect(noiseFloorDbm(20, 6) - noiseFloorDbm(20, 0)).toBeCloseTo(6, 6);
  });
});

describe("paparan RF", () => {
  it("menghitung kerapatan daya 1 W pada 1 m", () => {
    expect(powerDensityWm2(30, 1)).toBeCloseTo(1 / (4 * Math.PI), 5);
  });

  it("menghitung jarak aman 1 W terhadap 10 W/m2", () => {
    expect(safeDistanceM(30, 10)).toBeCloseTo(Math.sqrt(1 / (4 * Math.PI * 10)), 5);
  });
});

describe("zona Fresnel", () => {
  it("menghitung radius di tengah link 1 km pada 2.4 GHz", () => {
    expect(fresnelRadiusM(500, 500, 2400)).toBeCloseTo(5.588, 2);
  });

  it("clearance 60% dari radius", () => {
    expect(requiredClearanceM(1000, 2400)).toBeCloseTo(5.588 * 0.6, 2);
  });
});

describe("estimasi kecepatan", () => {
  it("memilih MCS tertinggi yang terpenuhi", () => {
    const r = estimateRate(40, 20, 1);
    expect(r.index).toBe(11);
    expect(r.phyMbps).toBeCloseTo(143.4, 3);
    expect(r.realMbps).toBeCloseTo(143.4 * 0.6, 3);
  });

  it("mengalikan lebar kanal dan stream", () => {
    expect(estimateRate(40, 40, 2).phyMbps).toBeCloseTo(143.4 * 2 * 2, 3);
  });

  it("mengembalikan null bila SNR terlalu rendah", () => {
    expect(estimateRate(2, 20, 1)).toBeNull();
  });
});
