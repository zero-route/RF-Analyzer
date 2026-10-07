import { channelOverlap } from "./floorplan";

export function rankChannels(candidates, neighbors, widthMHz = 20) {
  return candidates
    .map((channel) => {
      let sumMw = 0;
      let affecting = 0;
      for (const n of neighbors) {
        const overlap = channelOverlap(channel.centerMHz, n.chMHz, widthMHz);
        if (overlap <= 0) continue;
        sumMw += overlap * Math.pow(10, n.rssi / 10);
        affecting += 1;
      }
      return {
        channel,
        affecting,
        sumMw,
        interferenceDbm: sumMw > 0 ? 10 * Math.log10(sumMw) : null,
      };
    })
    .sort(
      (a, b) =>
        a.sumMw - b.sumMw ||
        a.affecting - b.affecting ||
        (b.channel.clear ? 1 : 0) - (a.channel.clear ? 1 : 0)
    );
}
