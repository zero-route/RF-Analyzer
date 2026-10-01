export const ANTENNA_PRESETS = [
  { id: "duck2", label: "Omni karet 2 dBi", type: "omni", gainDbi: 2 },
  { id: "omni5", label: "Omni 5 dBi", type: "omni", gainDbi: 5 },
  { id: "omni9", label: "Omni fiberglass 9 dBi", type: "omni", gainDbi: 9 },
  { id: "sector14", label: "Sektoral 14 dBi (90°)", type: "sector", gainDbi: 14, sectorH: 90 },
  { id: "sector17", label: "Sektoral 17 dBi (60°)", type: "sector", gainDbi: 17, sectorH: 60 },
  { id: "yagi12", label: "Yagi 12 dBi", type: "directional", gainDbi: 12 },
  { id: "panel19", label: "Panel 19 dBi", type: "directional", gainDbi: 19 },
  { id: "grid24", label: "Grid parabola 24 dBi", type: "directional", gainDbi: 24 },
];
