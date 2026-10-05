export const REGIONS = [
  {
    id: "eu",
    label: "Eropa",
    ch24Max: 13,
    ch6Max: 93,
    custom: false,
    note: "Acuan ETSI (EN 300 328 dan EN 301 893) dan ICNIRP. Pita 6 GHz hanya bagian bawah.",
    limits: [
      { id: "24", label: "2.4 GHz", minMHz: 2400, maxMHz: 2483.5, limitDbm: 20 },
      { id: "5low", label: "5.15–5.35 GHz", minMHz: 5150, maxMHz: 5350, limitDbm: 23 },
      { id: "5high", label: "5.47–5.725 GHz", minMHz: 5470, maxMHz: 5725, limitDbm: 30 },
    ],
  },
  {
    id: "us",
    label: "Amerika Serikat",
    ch24Max: 11,
    ch6Max: 233,
    custom: false,
    note: "Ringkasan umum aturan FCC Part 15, angka perkiraan dan sangat bergantung jenis perangkat dan antena. Verifikasi sebelum dipakai.",
    limits: [
      { id: "24", label: "2.4 GHz", minMHz: 2400, maxMHz: 2483.5, limitDbm: 36 },
      { id: "5low", label: "5.15–5.35 GHz", minMHz: 5150, maxMHz: 5350, limitDbm: 30 },
      { id: "5high", label: "5.47–5.725 GHz", minMHz: 5470, maxMHz: 5725, limitDbm: 30 },
      { id: "5top", label: "5.725–5.85 GHz", minMHz: 5725, maxMHz: 5850, limitDbm: 36 },
    ],
  },
  {
    id: "id",
    label: "Indonesia",
    ch24Max: 13,
    ch6Max: 93,
    custom: true,
    note: "Angka belum diverifikasi. Nilai awal disalin dari acuan Eropa, ganti sesuai aturan Komdigi/SDPPI yang berlaku.",
    limits: [
      { id: "24", label: "2.4 GHz", minMHz: 2400, maxMHz: 2483.5, limitDbm: 20, key: "customLimit24" },
      { id: "5low", label: "5.15–5.35 GHz", minMHz: 5150, maxMHz: 5350, limitDbm: 23, key: "customLimit5Low" },
      { id: "5high", label: "5.47–5.725 GHz", minMHz: 5470, maxMHz: 5725, limitDbm: 30, key: "customLimit5High" },
    ],
  },
];

export const EXPOSURE_LIMITS = [
  { value: "public", label: "Publik umum", limitWm2: 10 },
  { value: "worker", label: "Pekerja", limitWm2: 50 },
];

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}

export function limitsFor(region, state) {
  return region.limits.map((l) => ({
    ...l,
    limitDbm: l.key && Number.isFinite(state[l.key]) ? state[l.key] : l.limitDbm,
  }));
}

export function findLimit(region, state, freqMHz) {
  return limitsFor(region, state).find((l) => freqMHz >= l.minMHz && freqMHz <= l.maxMHz) ?? null;
}
