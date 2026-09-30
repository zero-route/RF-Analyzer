import { clamp } from "./clamp";

const STOPS = [
  [228, 232, 218],
  [195, 205, 176],
  [148, 165, 127],
  [100, 122, 87],
  [63, 86, 56],
  [35, 51, 31],
];

const STOPS_DARK = [
  [30, 38, 27],
  [52, 68, 46],
  [86, 108, 76],
  [128, 152, 112],
  [172, 194, 152],
  [214, 228, 196],
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
