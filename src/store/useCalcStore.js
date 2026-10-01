import { create } from "zustand";

export const DEFAULTS = {
  txDbm: 0,
  txUnit: "dbm",
  gainDbi: 2,
  antCount: 1,
  cableLossDb: 0.5,
  sourceMode: "independent",
  phaseMode: "coherent",
  splitterExtraDb: 0.5,
  isolated: false,
  freqMHz: 2400,
  distanceM: 5,
  obstructionDb: 0,
  rxGainDbi: 0,
  rxCableLossDb: 0,
  rxSensitivityDbm: -90,
  fadeMarginDb: 10,
  antennaType: "omni",
  sectorH: 90,
  activeTab: "summary",
};

export const useCalcStore = create((set) => ({
  ...DEFAULTS,
  update: (patch) => set(patch),
  reset: () => set({ ...DEFAULTS }),
}));
