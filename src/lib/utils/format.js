export function formatPower(mw) {
  if (mw >= 1000) return `${(mw / 1000).toFixed(2)} W`;
  if (mw < 1) return `${mw.toFixed(3)} mW`;
  return `${mw.toFixed(2)} mW`;
}

export function formatDb(value, digits = 1) {
  return `${value.toFixed(digits)} dB`;
}

export function formatDbm(value, digits = 1) {
  return `${value.toFixed(digits)} dBm`;
}

export function formatDistance(m) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  if (m >= 10) return `${m.toFixed(0)} m`;
  return `${m.toFixed(1)} m`;
}

export function formatLength(m) {
  if (!Number.isFinite(m)) return "—";
  if (m < 1) return `${(m * 100).toFixed(m < 0.1 ? 1 : 0)} cm`;
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  if (m >= 10) return `${m.toFixed(0)} m`;
  return `${m.toFixed(1)} m`;
}
