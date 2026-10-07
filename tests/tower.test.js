import { describe, expect, it } from "vitest";
import { earthBulgeM, radioHorizonKm, requiredTowerHeights } from "../src/lib/rf/tower";

describe("tinggi menara", () => {
  it("menghitung tonjolan bumi di tengah link 10 km", () => {
    expect(earthBulgeM(5000, 5000, 4 / 3)).toBeCloseTo(1.47, 1);
  });

  it("jarak pandang radio standar", () => {
    expect(radioHorizonKm(10, 10, 4 / 3)).toBeCloseTo(3.57 * Math.sqrt(4 / 3) * 2 * Math.sqrt(10), 6);
  });

  it("menghitung tinggi sama di kedua menara tanpa halangan", () => {
    const r = requiredTowerHeights({ distanceM: 10000, freqMHz: 2400, rxHeightM: 12 });
    expect(r.equalHeightM).toBeCloseTo(12.07, 1);
    expect(r.txHeightM).toBeCloseTo(r.equalHeightM, 1);
  });

  it("halangan menaikkan tinggi yang dibutuhkan", () => {
    const flat = requiredTowerHeights({ distanceM: 10000, freqMHz: 2400, rxHeightM: 10 });
    const blocked = requiredTowerHeights({
      distanceM: 10000,
      freqMHz: 2400,
      rxHeightM: 10,
      obstacleHeightM: 20,
      obstaclePos: 0.8,
    });
    expect(blocked.equalHeightM).toBeGreaterThan(flat.equalHeightM);
    expect(blocked.txHeightM).toBeGreaterThan(flat.txHeightM);
  });

  it("antena RX lebih tinggi menurunkan tinggi TX", () => {
    const low = requiredTowerHeights({ distanceM: 10000, freqMHz: 2400, rxHeightM: 5 });
    const high = requiredTowerHeights({ distanceM: 10000, freqMHz: 2400, rxHeightM: 20 });
    expect(high.txHeightM).toBeLessThan(low.txHeightM);
  });

  it("k lebih kecil menaikkan tonjolan bumi", () => {
    expect(earthBulgeM(5000, 5000, 2 / 3)).toBeGreaterThan(earthBulgeM(5000, 5000, 4 / 3));
  });
});
