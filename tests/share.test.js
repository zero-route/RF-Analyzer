import { describe, expect, it } from "vitest";
import { fromSearchParams, sanitizeState, toSearchParams } from "../src/lib/utils/shareState";
import { buildChannels, channelAt } from "../src/lib/data/channels";
import { findLimit, getRegion } from "../src/lib/data/regulations";

describe("sanitizeState", () => {
  it("membatasi angka ke rentang yang valid", () => {
    const out = sanitizeState({ txDbm: 99, gainDbi: -5, antCount: 2.6 });
    expect(out.txDbm).toBe(40);
    expect(out.gainDbi).toBe(0);
    expect(out.antCount).toBe(3);
  });

  it("menolak pilihan yang tidak dikenal", () => {
    expect(sanitizeState({ antennaType: "laser", region: "xx" })).toEqual({});
  });

  it("mengabaikan kunci asing", () => {
    expect(sanitizeState({ hack: 1, txDbm: 10 })).toEqual({ txDbm: 10 });
  });
});

describe("tautan bagikan", () => {
  it("bolak-balik tanpa kehilangan nilai", () => {
    const state = { txDbm: 12.5, antennaType: "sector", isolated: true, freqMHz: 5500, region: "us" };
    const params = toSearchParams(state).toString();
    const back = fromSearchParams(`?${params}`);
    expect(back).toMatchObject(state);
  });
});

describe("rencana kanal", () => {
  it("2.4 GHz punya 13 kanal dan 3 yang bebas tumpang tindih", () => {
    const ch = buildChannels("24", 20);
    expect(ch).toHaveLength(13);
    expect(ch.filter((c) => c.clear)).toHaveLength(3);
  });

  it("profil AS hanya sampai kanal 11", () => {
    expect(buildChannels("24", 20, getRegion("us"))).toHaveLength(11);
  });

  it("5 GHz 80 MHz menggabung empat kanal 20 MHz", () => {
    const ch = buildChannels("5", 80);
    expect(ch[0].label).toBe("36–48");
    expect(ch[0].centerMHz).toBe(5210);
  });

  it("menemukan kanal dari frekuensi", () => {
    expect(channelAt(buildChannels("24", 20), 2437).label).toBe("6");
  });
});

describe("profil aturan", () => {
  it("mencari batas EIRP sesuai pita", () => {
    const eu = getRegion("eu");
    expect(findLimit(eu, {}, 2437).limitDbm).toBe(20);
    expect(findLimit(eu, {}, 5500).limitDbm).toBe(30);
    expect(findLimit(eu, {}, 5800)).toBeNull();
  });

  it("profil kustom memakai nilai dari state", () => {
    const id = getRegion("id");
    expect(findLimit(id, { customLimit24: 27 }, 2437).limitDbm).toBe(27);
  });
});
