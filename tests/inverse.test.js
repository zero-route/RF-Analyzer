import { describe, expect, it } from "vitest";
import { requiredEirpForRange, requiredGainDbi, requiredTxDbm } from "../src/lib/rf/inverse";
import { computeEirp } from "../src/lib/rf/eirp";
import { fsplDb } from "../src/lib/rf/fspl";

const state = {
  txDbm: 10,
  gainDbi: 6,
  cableLossDb: 1,
  antCount: 1,
  sourceMode: "independent",
  phaseMode: "coherent",
  splitterExtraDb: 0,
  freqMHz: 2400,
  environment: "free",
  obstructionDb: 0,
  rxGainDbi: 0,
  rxCableLossDb: 0,
  rxSensitivityDbm: -90,
  fadeMarginDb: 10,
};

describe("hitung terbalik", () => {
  it("mencari daya TX untuk target EIRP", () => {
    expect(requiredTxDbm(20, state)).toBeCloseTo(15, 6);
  });

  it("mencari gain untuk target EIRP", () => {
    expect(requiredGainDbi(20, state)).toBeCloseTo(11, 6);
  });

  it("hasilnya menghasilkan target EIRP bila diterapkan", () => {
    const tx = requiredTxDbm(23, state);
    expect(computeEirp({ ...state, txDbm: tx }).eirpDbm).toBeCloseTo(23, 6);
  });

  it("menghitung EIRP untuk target jangkauan", () => {
    expect(requiredEirpForRange(100, state)).toBeCloseTo(-80 + fsplDb(100, 2400), 5);
  });

  it("dinding menambah EIRP yang dibutuhkan", () => {
    const withWall = { ...state, wallBrick: 2 };
    expect(requiredEirpForRange(100, withWall) - requiredEirpForRange(100, state)).toBeCloseTo(14, 6);
  });
});
