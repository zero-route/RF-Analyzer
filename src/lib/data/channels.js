export const CHANNEL_BANDS = [
  {
    id: "24",
    label: "2.4 GHz",
    rangeMHz: [2400, 2500],
    tickStep: 20,
    widths: [20],
    pxPerMHz: 7,
    note: "Hanya kanal 1, 6, dan 11 yang tidak saling tumpang tindih pada lebar 20 MHz. Kanal 14 hanya untuk Jepang dan tidak ditampilkan.",
  },
  {
    id: "5",
    label: "5 GHz",
    rangeMHz: [5150, 5850],
    tickStep: 100,
    widths: [20, 40, 80, 160],
    pxPerMHz: 1.4,
    note: "Kanal bergaris putus-putus memakai DFS: perangkat wajib mendeteksi radar dan bisa berpindah kanal otomatis.",
  },
  {
    id: "6",
    label: "6 GHz",
    rangeMHz: [5925, 7125],
    tickStep: 100,
    widths: [20, 40, 80, 160],
    pxPerMHz: 0.9,
    note: "Pita 6 GHz (Wi-Fi 6E/7) tidak tersedia di semua negara dan rentangnya berbeda. Cek aturan setempat.",
  },
];

function range(from, to, step) {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
}

function chunk(run, size) {
  const out = [];
  for (let i = 0; i + size <= run.length; i += size) out.push(run.slice(i, i + size));
  return out;
}

const RUNS_5 = [range(36, 64, 4), range(100, 144, 4), range(149, 165, 4)];
const isDfs = (ch) => (ch >= 52 && ch <= 64) || (ch >= 100 && ch <= 144);

export function buildChannels(bandId, widthMHz) {
  if (bandId === "24") {
    return range(1, 13, 1).map((ch) => ({
      key: `24-${ch}`,
      label: String(ch),
      centerMHz: 2407 + 5 * ch,
      widthMHz: 20,
      dfs: false,
      clear: [1, 6, 11].includes(ch),
    }));
  }

  const base = bandId === "5" ? 5000 : 5950;
  const runs = bandId === "5" ? RUNS_5 : [range(1, 233, 4)];
  const size = Math.max(1, Math.round(widthMHz / 20));

  return runs
    .flatMap((run) => chunk(run, size))
    .map((group) => {
      const first = group[0];
      const last = group[group.length - 1];
      return {
        key: `${bandId}-${first}-${size}`,
        label: size === 1 ? String(first) : `${first}–${last}`,
        centerMHz: base + (5 * (first + last)) / 2,
        widthMHz,
        dfs: bandId === "5" && group.some(isDfs),
        clear: true,
      };
    });
}

export function bandForFreq(freqMHz) {
  if (freqMHz >= 5900) return "6";
  if (freqMHz >= 3000) return "5";
  return "24";
}

export function channelAt(channels, freqMHz) {
  let best = null;
  for (const channel of channels) {
    const half = channel.widthMHz / 2;
    if (freqMHz < channel.centerMHz - half || freqMHz > channel.centerMHz + half) continue;
    if (!best || Math.abs(freqMHz - channel.centerMHz) < Math.abs(freqMHz - best.centerMHz)) best = channel;
  }
  return best;
}
