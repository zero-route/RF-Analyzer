export const REFERENCE_LIMITS = [
  {
    id: "eu-24",
    label: "2.4 GHz (ETSI EN 300 328)",
    minMHz: 2400,
    maxMHz: 2483.5,
    limitDbm: 20,
  },
  {
    id: "eu-5low",
    label: "5.15–5.35 GHz (ETSI EN 301 893)",
    minMHz: 5150,
    maxMHz: 5350,
    limitDbm: 23,
  },
  {
    id: "eu-5high",
    label: "5.47–5.725 GHz (ETSI EN 301 893)",
    minMHz: 5470,
    maxMHz: 5725,
    limitDbm: 30,
  },
];

export const EXPOSURE_LIMITS = [
  { value: "public", label: "Publik umum", limitWm2: 10 },
  { value: "worker", label: "Pekerja", limitWm2: 50 },
];

export const REGULATION_NOTE =
  "Angka acuan Eropa (ETSI) dan ICNIRP, bukan aturan Indonesia. Cek ketentuan terbaru dari Komdigi/SDPPI sebelum dipakai sebagai dasar izin atau keselamatan.";
