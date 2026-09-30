import { fsplDb, distanceForLoss } from "./fspl";

export function computeLinkBudget({
  eirpDbm,
  distanceM,
  freqMHz,
  obstructionDb,
  rxGainDbi,
  rxCableLossDb,
  fadeMarginDb,
  rxSensitivityDbm,
}) {
  const pathLossDb = fsplDb(distanceM, freqMHz);
  const rxPowerDbm = eirpDbm - pathLossDb - obstructionDb + rxGainDbi - rxCableLossDb;
  const marginDb = rxPowerDbm - rxSensitivityDbm - fadeMarginDb;

  const steps = [
    { key: "eirp", label: "EIRP", delta: eirpDbm, level: eirpDbm },
    { key: "fspl", label: "Rugi ruang bebas", delta: -pathLossDb, level: eirpDbm - pathLossDb },
    {
      key: "obstruction",
      label: "Halangan",
      delta: -obstructionDb,
      level: eirpDbm - pathLossDb - obstructionDb,
    },
    {
      key: "rxGain",
      label: "Gain antena RX",
      delta: rxGainDbi,
      level: eirpDbm - pathLossDb - obstructionDb + rxGainDbi,
    },
    { key: "rxCable", label: "Rugi kabel RX", delta: -rxCableLossDb, level: rxPowerDbm },
  ];

  return { pathLossDb, rxPowerDbm, marginDb, steps };
}

export function maxRangeM({
  eirpDbm,
  freqMHz,
  obstructionDb,
  rxGainDbi,
  rxCableLossDb,
  fadeMarginDb,
  rxSensitivityDbm,
}) {
  const allowedLossDb =
    eirpDbm - obstructionDb + rxGainDbi - rxCableLossDb - fadeMarginDb - rxSensitivityDbm;
  return distanceForLoss(allowedLossDb, freqMHz);
}

export function rxCurve({ eirpDbm, freqMHz, obstructionDb, rxGainDbi, rxCableLossDb }, maxDistM, points = 60) {
  const out = [];
  for (let i = 0; i < points; i += 1) {
    const d = Math.max(0.5, (maxDistM * (i + 1)) / points);
    out.push({
      distance: d,
      rx: eirpDbm - fsplDb(d, freqMHz) - obstructionDb + rxGainDbi - rxCableLossDb,
    });
  }
  return out;
}
