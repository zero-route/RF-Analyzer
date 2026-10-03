import { pathLossDb as pathLoss, distanceForPathLoss } from "./propagation";

export function computeLinkBudget({
  eirpDbm,
  distanceM,
  freqMHz,
  obstructionDb,
  rxGainDbi,
  rxCableLossDb,
  fadeMarginDb,
  rxSensitivityDbm,
  pathExponent = 2,
}) {
  const pathLossDb = pathLoss(distanceM, freqMHz, pathExponent);
  const rxPowerDbm = eirpDbm - pathLossDb - obstructionDb + rxGainDbi - rxCableLossDb;
  const marginDb = rxPowerDbm - rxSensitivityDbm - fadeMarginDb;

  const steps = [
    { key: "eirp", label: "EIRP", delta: eirpDbm, level: eirpDbm },
    { key: "fspl", label: "Rugi lintasan", delta: -pathLossDb, level: eirpDbm - pathLossDb },
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
  pathExponent = 2,
}) {
  const allowedLossDb =
    eirpDbm - obstructionDb + rxGainDbi - rxCableLossDb - fadeMarginDb - rxSensitivityDbm;
  return distanceForPathLoss(allowedLossDb, freqMHz, pathExponent);
}

export function rxCurve(
  { eirpDbm, freqMHz, obstructionDb, rxGainDbi, rxCableLossDb, pathExponent = 2 },
  maxDistM,
  points = 60
) {
  const out = [];
  for (let i = 0; i < points; i += 1) {
    const d = Math.max(0.5, (maxDistM * (i + 1)) / points);
    out.push({
      distance: d,
      rx: eirpDbm - pathLoss(d, freqMHz, pathExponent) - obstructionDb + rxGainDbi - rxCableLossDb,
    });
  }
  return out;
}
