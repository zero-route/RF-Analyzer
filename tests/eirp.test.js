import { describe, expect, it } from "vitest";
import { classifyEirp, computeEirp } from "../src/lib/rf/eirp";

const base = {
  txDbm: 20,
  gainDbi: 10,
  cableLossDb: 2,
  antCount: 1,
  sourceMode: "independent",
  phaseMode: "coherent",
  splitterExtraDb: 0,
};

describe("computeEirp", () => {
  it("menjumlah daya, gain, dan rugi kabel untuk satu antena", () => {
    expect(computeEirp(base).eirpDbm).toBeCloseTo(28, 6);
  });

  it("menambah gain susunan untuk antena sefase", () => {
    const r = computeEirp({ ...base, antCount: 4 });
    expect(r.arrayGainDb).toBeCloseTo(6.0206, 3);
    expect(r.eirpDbm).toBeCloseTo(34.0206, 3);
  });

  it("tidak menambah gain susunan untuk fase acak", () => {
    expect(computeEirp({ ...base, antCount: 4, phaseMode: "random" }).eirpDbm).toBeCloseTo(28, 6);
  });

  it("membagi daya lewat splitter", () => {
    const r = computeEirp({ ...base, antCount: 4, sourceMode: "splitter", splitterExtraDb: 1 });
    expect(r.perAntennaDbm).toBeCloseTo(20 - 6.0206 - 1, 3);
    expect(r.eirpDbm).toBeCloseTo(27, 3);
  });

  it("membatasi jumlah antena 1 sampai 12", () => {
    expect(computeEirp({ ...base, antCount: 99 }).antCount).toBe(12);
    expect(computeEirp({ ...base, antCount: 0 }).antCount).toBe(1);
  });
});

describe("classifyEirp", () => {
  it("memakai ambang 20 dan 30 dBm", () => {
    expect(classifyEirp(20, false).level).toBe("safe");
    expect(classifyEirp(20.1, false).level).toBe("permit");
    expect(classifyEirp(30, false).level).toBe("permit");
    expect(classifyEirp(30.1, false).level).toBe("danger");
  });

  it("menganggap dummy load terisolasi", () => {
    expect(classifyEirp(50, true).level).toBe("isolated");
  });
});
