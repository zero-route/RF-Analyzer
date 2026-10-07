"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Slider from "@/components/ui/Slider";
import { useCalcStore } from "@/store/useCalcStore";
import { requiredTowerHeights, radioHorizonKm } from "@/lib/rf/tower";
import { formatLength } from "@/lib/utils/format";

const K_OPTIONS = [
  { value: 4 / 3, label: "k = 4/3" },
  { value: 1, label: "k = 1" },
  { value: 2 / 3, label: "k = 2/3" },
];

export default function TowerHeight() {
  const distanceM = useCalcStore((s) => s.distanceM);
  const freqMHz = useCalcStore((s) => s.freqMHz);
  const [k, setK] = useState(4 / 3);
  const [rxHeight, setRxHeight] = useState(10);
  const [obstacleH, setObstacleH] = useState(0);
  const [obstaclePos, setObstaclePos] = useState(50);

  const r = requiredTowerHeights({
    distanceM: Math.max(distanceM, 1),
    freqMHz,
    k,
    rxHeightM: rxHeight,
    obstacleHeightM: obstacleH,
    obstaclePos: obstaclePos / 100,
  });
  const losKm = radioHorizonKm(r.txHeightM, rxHeight, k);

  return (
    <Card title="Tinggi menara minimum" tip="fresnel">
      <div className="grid items-start gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SegmentedControl label="Faktor lengkung bumi" options={K_OPTIONS} value={k} onChange={setK} />
          <Slider label="Tinggi antena RX" value={rxHeight} min={1} max={100} step={1} unit="m" digits={0} onChange={setRxHeight} />
          <Slider label="Tinggi halangan" value={obstacleH} min={0} max={100} step={1} unit="m" digits={0} onChange={setObstacleH} />
          {obstacleH > 0 && (
            <Slider label="Posisi halangan" value={obstaclePos} min={10} max={90} step={1} unit="%" digits={0} onChange={setObstaclePos} />
          )}
          <p className="text-xs leading-relaxed text-faint">
            Jarak link dan frekuensi mengikuti sidebar dan tab Link ({formatLength(distanceM)}, {freqMHz} MHz). Posisi halangan diukur dari menara TX.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="num text-3xl font-light tracking-tight text-ink">{r.equalHeightM.toFixed(1)} m</p>
            <p className="mt-1 text-sm text-muted">tinggi minimum bila kedua menara sama tinggi</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted">Menara TX (RX {rxHeight} m)</dt>
            <dd className="num text-right text-ink">{r.txHeightM.toFixed(1)} m</dd>
            <dt className="text-muted">Tonjolan bumi di tengah</dt>
            <dd className="num text-right text-ink">{r.bulgeMidM.toFixed(2)} m</dd>
            <dt className="text-muted">60% radius Fresnel di tengah</dt>
            <dd className="num text-right text-ink">{r.fresnelMidM.toFixed(1)} m</dd>
            <dt className="text-muted">Jarak pandang radio</dt>
            <dd className="num text-right text-ink">{losKm.toFixed(1)} km</dd>
          </dl>
          <p className="text-xs leading-relaxed text-faint">
            Tinggi dihitung dari tonjolan bumi, 60% zona Fresnel pertama, dan halangan di tengah medan datar. Medan nyata, pohon, dan bangunan perlu dicek di lokasi.
          </p>
        </div>
      </div>
    </Card>
  );
}