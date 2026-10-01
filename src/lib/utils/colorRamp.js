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
