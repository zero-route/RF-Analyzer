import { describe, expect, it } from "vitest";
import { distanceForLoss, fsplDb } from "../src/lib/rf/fspl";
import { distanceForPathLoss, pathLossDb, totalObstructionDb, wallLossDb } from "../src/lib/rf/propagation";
import { computeLinkBudget, maxRangeM } from "../src/lib/rf/linkBudget";

const params = {
  eirpDbm: 20,
  freqMHz: 2400,
  obstructionDb: 5,
  rxGainDbi: 3,
  rxCableLossDb: 1,
  fadeMarginDb: 10,
  rxSensitivityDbm: -90,
};

describe("rugi ruang bebas", () => {
  it("cocok dengan nilai referensi", () => {
    expect(fsplDb(1000, 2400)).toBeCloseTo(100.054, 2);
  });

  it("naik 6 dB tiap jarak berlipat dua", () => {
    expect(fsplDb(200, 2400) - fsplDb(100, 2400)).toBeCloseTo(6.02, 2);
  });

  it("bisa dibalik ke jarak", () => {
    expect(distanceForLoss(fsplDb(250, 5800), 5800)).toBeCloseTo(250, 3);
  });
});

describe("model lintasan", () => {
  it("eksponen 2 sama dengan ruang bebas", () => {
    expect(pathLossDb(10, 2400, 2)).toBeCloseTo(fsplDb(10, 2400), 6);
  });

  it("eksponen lebih besar menambah rugi per dekade jarak", () => {
    expect(pathLossDb(10, 2400, 3) - fsplDb(1, 2400)).toBeCloseTo(30, 6);
  });

  it("bisa dibalik ke jarak", () => {
    expect(distanceForPathLoss(pathLossDb(37, 5000, 2.7), 5000, 2.7)).toBeCloseTo(37, 3);
  });

  it("menjumlah rugi dinding sesuai pita", () => {
    const state = { freqMHz: 2400, obstructionDb: 2, wallBrick: 2, wallDrywall: 1 };
    expect(wallLossDb(state)).toBeCloseTo(17, 6);
    expect(totalObstructionDb(state)).toBeCloseTo(19, 6);
    expect(wallLossDb({ ...state, freqMHz: 5500 })).toBeCloseTo(24, 6);
  });
});

describe("link budget", () => {
  it("menghitung daya terima", () => {
    const r = computeLinkBudget({ ...params, distanceM: 100 });
    expect(r.rxPowerDbm).toBeCloseTo(20 - fsplDb(100, 2400) - 5 + 3 - 1, 6);
  });

  it("margin nol tepat di jangkauan maksimum", () => {
    const range = maxRangeM(params);
    expect(computeLinkBudget({ ...params, distanceM: range }).marginDb).toBeCloseTo(0, 5);
  });

  it("konsisten untuk eksponen lintasan lain", () => {
    const withExp = { ...params, pathExponent: 3 };
    const range = maxRangeM(withExp);
    expect(computeLinkBudget({ ...withExp, distanceM: range }).marginDb).toBeCloseTo(0, 5);
  });
});
