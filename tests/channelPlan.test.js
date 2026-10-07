import { describe, expect, it } from "vitest";
import { rankChannels } from "../src/lib/rf/channelPlan";
import { buildChannels } from "../src/lib/data/channels";

const channels = buildChannels("24", 20);

describe("saran kanal terbaik", () => {
  it("tanpa tetangga memilih kanal yang bebas tumpang tindih", () => {
    const [best] = rankChannels(channels, []);
    expect(best.channel.clear).toBe(true);
    expect(best.interferenceDbm).toBeNull();
  });

  it("menghindari kanal yang dipakai tetangga kuat", () => {
    const ranked = rankChannels(channels, [
      { chMHz: 2437, rssi: -50 },
      { chMHz: 2412, rssi: -70 },
    ]);
    expect(ranked[0].channel.label).toBe("11");
    const six = ranked.find((r) => r.channel.label === "6");
    expect(six.affecting).toBeGreaterThan(0);
    expect(six.sumMw).toBeGreaterThan(ranked[0].sumMw);
  });

  it("tetangga lebih kuat memberi interferensi lebih besar", () => {
    const strong = rankChannels(channels, [{ chMHz: 2437, rssi: -40 }]).find((r) => r.channel.label === "6");
    const weak = rankChannels(channels, [{ chMHz: 2437, rssi: -80 }]).find((r) => r.channel.label === "6");
    expect(strong.interferenceDbm).toBeGreaterThan(weak.interferenceDbm);
  });
});
