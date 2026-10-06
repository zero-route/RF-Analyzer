import { describe, expect, it } from "vitest";
import { dbToLinear, dbdToDbi, dbiToDbd, dbmToMw, dbmToW, mwToDbm } from "../src/lib/rf/units";
import { fromDbm, toDbm } from "../src/lib/rf/tools";

describe("konversi satuan", () => {
  it("mengubah dBm dan mW dua arah", () => {
    expect(dbmToMw(30)).toBeCloseTo(1000, 6);
    expect(dbmToMw(0)).toBeCloseTo(1, 6);
    expect(mwToDbm(100)).toBeCloseTo(20, 6);
    expect(dbmToW(30)).toBeCloseTo(1, 6);
  });

  it("menghubungkan dBi dan dBd", () => {
    expect(dbiToDbd(2.15)).toBeCloseTo(0, 6);
    expect(dbdToDbi(0)).toBeCloseTo(2.15, 6);
  });

  it("mengubah dB ke rasio linear", () => {
    expect(dbToLinear(3)).toBeCloseTo(1.9953, 3);
    expect(dbToLinear(10)).toBeCloseTo(10, 6);
  });

  it("mengubah semua satuan lewat dBm", () => {
    expect(toDbm(1, "w")).toBeCloseTo(30, 6);
    expect(toDbm(0, "dbw")).toBeCloseTo(30, 6);
    const out = fromDbm(20);
    expect(out.mw).toBeCloseTo(100, 6);
    expect(out.dbw).toBeCloseTo(-10, 6);
    expect(out.dbuv).toBeCloseTo(127, 6);
  });
});
