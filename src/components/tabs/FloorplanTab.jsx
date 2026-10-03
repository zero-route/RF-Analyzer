"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import FloorplanCanvas from "@/components/floorplan/FloorplanCanvas";
import { useFloorplanStore } from "@/store/useFloorplanStore";
import { useRfModel } from "@/hooks/useRfModel";
import { useIsDark } from "@/hooks/useIsDark";
import { WALL_TYPES } from "@/lib/rf/propagation";
import { LEVEL_T, computeHeatmap, legendItems, wallLossFor } from "@/lib/rf/floorplan";
import { rampColor } from "@/lib/utils/colorRamp";

const TOOLS = [
  { id: "select", label: "Geser AP" },
  { id: "wall", label: "Dinding" },
  { id: "ap", label: "Tambah AP" },
  { id: "erase", label: "Hapus" },
];

const HINTS = {
  select: "Seret titik AP untuk memindahkannya.",
  wall: "Seret di denah untuk menggambar dinding. Panjangnya tampil saat menggambar.",
  ap: "Ketuk denah untuk menaruh access point (maksimal 6).",
  erase: "Ketuk dinding atau AP untuk menghapusnya.",
};

export default function FloorplanTab() {
  const { state, eirp } = useRfModel();
  const dark = useIsDark();
  const { widthM, heightM, walls, aps, setSize, addOuterWalls, clear } = useFloorplanStore();
  const [tool, setTool] = useState("wall");
  const [wallType, setWallType] = useState("wallBrick");

  useEffect(() => {
    useFloorplanStore.persist.rehydrate();
  }, []);

  const heat = useMemo(
    () =>
      computeHeatmap({
        walls,
        aps,
        widthM,
        heightM,
        eirpDbm: eirp.eirpDbm,
        freqMHz: state.freqMHz,
        rxGainDbi: state.rxGainDbi,
        rxCableLossDb: state.rxCableLossDb,
        sensitivityDbm: state.rxSensitivityDbm,
      }),
    [walls, aps, widthM, heightM, eirp.eirpDbm, state.freqMHz, state.rxGainDbi, state.rxCableLossDb, state.rxSensitivityDbm]
  );

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card title="Denah ruangan" action={<span className="num text-sm text-faint">{widthM} × {heightM} m</span>}>
        <div className="flex flex-col gap-4">
          <FloorplanCanvas tool={tool} wallType={wallType} heat={heat} dark={dark} />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted sm:grid-cols-3">
            {legendItems(state.rxSensitivityDbm).map((item) => (
              <li key={item.level} className="flex items-center gap-2">
                <span
                  className="h-3 w-5 shrink-0 rounded-sm border border-line"
                  style={{ background: rampColor(LEVEL_T[item.level], dark) }}
                />
                <span className="num">{item.label}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="h-3 w-5 shrink-0 rounded-sm border border-line bg-surface" />
              <span>Tanpa sinyal</span>
            </li>
          </ul>
          <p className="text-xs leading-relaxed text-faint">
            Model multi-dinding: rugi ruang bebas ditambah rugi setiap dinding yang dilewati garis lurus dari AP ke titik. Semua AP memakai EIRP dari sidebar dan yang terkuat ditampilkan. Garis tebal menandai bahan yang lebih menahan sinyal.
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card title="Alat">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              {TOOLS.map((t) => (
                <Button
                  key={t.id}
                  variant={tool === t.id ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setTool(t.id)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-faint">{HINTS[tool]}</p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="wall-type" className="text-sm text-muted">
                Bahan dinding
              </label>
              <select
                id="wall-type"
                value={wallType}
                onChange={(e) => setWallType(e.target.value)}
                className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
              >
                {WALL_TYPES.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.label} ({wallLossFor(w.key, state.freqMHz)} dB)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Lebar" unit="m" value={widthM} min={3} max={60} step={0.5} onChange={(v) => setSize(v, heightM)} />
              <NumberField label="Panjang" unit="m" value={heightM} min={3} max={60} step={0.5} onChange={(v) => setSize(widthM, v)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => addOuterWalls(wallType)}>
                Dinding luar
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                Hapus semua
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Hasil">
          {heat.stats ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted">Jumlah AP</dt>
              <dd className="num text-right text-ink">{aps.length}</dd>
              <dt className="text-muted">EIRP tiap AP</dt>
              <dd className="num text-right text-ink">{eirp.eirpDbm.toFixed(1)} dBm</dd>
              <dt className="text-muted">Area tercakup</dt>
              <dd className="num text-right text-ink">{heat.stats.coveragePct.toFixed(0)}%</dd>
              <dt className="text-muted">Sinyal baik (≥ −70)</dt>
              <dd className="num text-right text-ink">{heat.stats.goodPct.toFixed(0)}%</dd>
            </dl>
          ) : (
            <p className="text-sm leading-relaxed text-muted">Taruh minimal satu AP dengan alat "Tambah AP" untuk melihat peta sinyal.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
