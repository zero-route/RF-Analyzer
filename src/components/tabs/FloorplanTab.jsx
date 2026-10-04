"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import FloorplanCanvas from "@/components/floorplan/FloorplanCanvas";
import { useFloorplanStore } from "@/store/useFloorplanStore";
import { useRfModel } from "@/hooks/useRfModel";
import { WALL_TYPES } from "@/lib/rf/propagation";
import { LEVEL_COLORS, computeHeatmap, legendItems, wallLossFor } from "@/lib/rf/floorplan";

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
  const { widthM, heightM, walls, aps, setSize, addOuterWalls, clear } = useFloorplanStore();
  const [tool, setTool] = useState("wall");
  const [wallType, setWallType] = useState("wallBrick");
  const [expanded, setExpanded] = useState(false);

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
    <div className="flex flex-col gap-4">
      <div
        className={
          expanded
            ? "fixed inset-0 z-50 overflow-auto bg-bg p-4"
            : "rounded-lg border border-line bg-surface p-4"
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted">
              Denah ruangan <span className="num ml-2 text-faint">{widthM} × {heightM} m</span>
            </h2>
            <Button variant="secondary" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Tutup" : "Perbesar"}
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-0 flex-1 grid-cols-4 gap-2" style={{ minWidth: "16rem" }}>
              {TOOLS.map((t) => (
                <Button
                  key={t.id}
                  variant={tool === t.id ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setTool(t.id)}
                  className="px-1"
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <select
              aria-label="Bahan dinding"
              value={wallType}
              onChange={(e) => setWallType(e.target.value)}
              className="h-8 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink sm:w-56"
            >
              {WALL_TYPES.map((w) => (
                <option key={w.key} value={w.key}>
                  {w.label} ({wallLossFor(w.key, state.freqMHz)} dB)
                </option>
              ))}
            </select>
          </div>
          <p className="-mt-2 text-xs text-faint">{HINTS[tool]}</p>

          <div
            className="mx-auto w-full"
            style={{
              maxWidth: expanded ? `calc((100dvh - 15rem) * ${widthM / heightM})` : undefined,
            }}
          >
            <FloorplanCanvas tool={tool} wallType={wallType} heat={heat} />
          </div>

          <ul className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs text-muted sm:grid-cols-4">
            {legendItems(state.rxSensitivityDbm).map((item) => (
              <li key={item.level} className="flex items-center gap-2">
                <span
                  className="h-3 w-5 shrink-0 rounded-sm border border-line"
                  style={{ background: LEVEL_COLORS[item.level] }}
                />
                <span className="num">{item.label}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="h-3 w-5 shrink-0 rounded-sm border border-line bg-surface" />
              <span>Tanpa sinyal</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card title="Pengaturan denah">
          <div className="flex flex-col gap-4">
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
            <p className="text-xs leading-relaxed text-faint">
              Model multi-dinding: rugi ruang bebas ditambah rugi tiap dinding yang dilewati garis lurus dari AP ke titik. Warna mengikuti kekuatan sinyal yang sudah memperhitungkan jarak dan dinding, jadi area di balik tembok bergeser ke kuning atau merah, atau kosong bila di bawah sensitivitas. Semua AP memakai EIRP dari sidebar dan yang terkuat ditampilkan.
            </p>
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
              <dt className="text-muted">Area sinyal kuat (biru)</dt>
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
