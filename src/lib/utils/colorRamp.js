import { clamp } from "./clamp";

const STOPS = [
  [236, 236, 236],
  [208, 208, 208],
  [168, 168, 168],
  [122, 122, 122],
  [72, 72, 72],
  [24, 24, 24],
];

const STOPS_DARK = [
  [34, 34, 34],
  [62, 62, 62],
  [100, 100, 100],
  [146, 146, 146],
  [196, 196, 196],
  [240, 240, 240],
];

export function rampRgb(t, dark = false) {
  const stops = dark ? STOPS_DARK : STOPS;
  const value = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.min(Math.floor(value), stops.length - 2);
  const f = value - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

export function rampColor(t, dark = false) {
  const [r, g, b] = rampRgb(t, dark);
  return `rgb(${r}, ${g}, ${b})`;
}

export function rampHex(t, dark = false) {
  const [r, g, b] = rampRgb(t, dark);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function rampNumber(t, dark = false) {
  const [r, g, b] = rampRgb(t, dark);
  return (r << 16) | (g << 8) | b;
}

const HEAT_STOPS = [
  [0, [15, 30, 220]],
  [0.15, [10, 120, 235]],
  [0.28, [30, 200, 225]],
  [0.42, [30, 190, 90]],
  [0.52, [60, 185, 40]],
  [0.62, [170, 210, 30]],
  [0.72, [245, 225, 20]],
  [0.85, [250, 135, 10]],
  [1, [230, 20, 15]],
];

export function heatRgb(t) {
  const value = clamp(t, 0, 1);
  for (let i = 0; i < HEAT_STOPS.length - 1; i += 1) {
    const [p0, c0] = HEAT_STOPS[i];
    const [p1, c1] = HEAT_STOPS[i + 1];
    if (value <= p1) {
      const f = (value - p0) / (p1 - p0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * f),
        Math.round(c0[1] + (c1[1] - c0[1]) * f),
        Math.round(c0[2] + (c1[2] - c0[2]) * f),
      ];
    }
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1][1];
}

export const HEAT_GRADIENT = `linear-gradient(to right, ${HEAT_STOPS.map(
  ([p, c]) => `rgb(${c[0]}, ${c[1]}, ${c[2]}) ${Math.round(p * 100)}%`
).join(", ")})`;
