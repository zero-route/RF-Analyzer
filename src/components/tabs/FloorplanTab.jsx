"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import Slider from "@/components/ui/Slider";
import FloorplanCanvas from "@/components/floorplan/FloorplanCanvas";
import { useFloorplanStore } from "@/store/useFloorplanStore";
import { useCalcStore } from "@/store/useCalcStore";
import { useRfModel } from "@/hooks/useRfModel";
import { WALL_TYPES } from "@/lib/rf/propagation";
import {
  CLIENT_KINDS,
  DEFAULT_AP_RATE,
  LEVEL_COLORS,
  clientLabel,
  computeClients,
  computeHeatmap,
  legendItems,
  wallLossFor,
} from "@/lib/rf/floorplan";
import { formatRate } from "@/lib/rf/throughput";

const TOOLS = [
  { id: "select", label: "Geser" },
  { id: "wall", label: "Dinding" },
  { id: "ap", label: "+ AP" },
  { id: "client", label: "+ Penerima" },
  { id: "erase", label: "Hapus" },
];

const HINTS = {
  select: "Seret AP atau penerima untuk memindahkan. Ketuk AP untuk memilihnya dan mengatur kuotanya.",
  wall: "Seret di denah untuk menggambar dinding. Panjangnya tampil saat menggambar.",
  ap: "Ketuk denah untuk menaruh access point (maksimal 6).",
  client: "Ketuk denah untuk menaruh penerima: HP, laptop, atau PC (maksimal 8).",
  erase: "Ketuk dinding, AP, atau penerima untuk menghapusnya.",
};

const selectClass = "h-8 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink sm:w-56";

export default function FloorplanTab() {
  const { state, eirp } = useRfModel();
  const bandwidthMHz = useCalcStore((s) => s.bandwidthMHz);
  const noiseFigureDb = useCalcStore((s) => s.noiseFigureDb);
  const { widthM, heightM, walls, aps, clients, setSize, setApRate, addOuterWalls, clear } = useFloorplanStore();
  const [tool, setTool] = useState("wall");
  const [wallType, setWallType] = useState("wallBrick");
  const [clientKind, setClientKind] = useState("hp");
  const [selectedApId, setSelectedApId] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    useFloorplanStore.persist.rehydrate();
  }, []);

  const selectedAp = aps.find((a) => a.id === selectedApId) ?? aps[0] ?? null;

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

  const results = useMemo(
    () =>
      computeClients({
        clients,
        aps,
        walls,
        eirpDbm: eirp.eirpDbm,
        freqMHz: state.freqMHz,
        rxGainDbi: state.rxGainDbi,
        rxCableLossDb: state.rxCableLossDb,
        sensitivityDbm: state.rxSensitivityDbm,
        bandwidthMHz,
        noiseFigureDb,
      }),
    [
      clients,
      aps,
      walls,
      eirp.eirpDbm,
      state.freqMHz,
      state.rxGainDbi,
      state.rxCableLossDb,
      state.rxSensitivityDbm,
      bandwidthMHz,
      noiseFigureDb,
    ]
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          expanded ? "fixed inset-0 z-50 overflow-auto bg-bg p-4" : "rounded-lg border border-line bg-surface p-4"
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
            <div className="grid min-w-0 flex-1 grid-cols-5 gap-2" style={{ minWidth: "20rem" }}>
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
            {tool === "wall" && (
              <select
                aria-label="Bahan dinding"
                value={wallType}
                onChange={(e) => setWallType(e.target.value)}
                className={selectClass}
              >
                {WALL_TYPES.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.label} ({wallLossFor(w.key, state.freqMHz)} dB)
                  </option>
                ))}
              </select>
            )}
            {tool === "client" && (
              <select
                aria-label="Jenis penerima"
                value={clientKind}
                onChange={(e) => setClientKind(e.target.value)}
                className={selectClass}
              >
                {CLIENT_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label} ({k.streams} stream)
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="-mt-2 text-xs text-faint">{HINTS[tool]}</p>

          <div
            className="mx-auto w-full"
            style={{ maxWidth: expanded ? `calc((100dvh - 15rem) * ${widthM / heightM})` : undefined }}
          >
            <FloorplanCanvas
              tool={tool}
              wallType={wallType}
              clientKind={clientKind}
              heat={heat}
              results={results}
              selectedApId={selectedAp?.id ?? null}
              onSelectAp={setSelectedApId}
            />
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
        <div className="flex flex-col gap-4">
          <Card title="Kuota access point">
            {selectedAp ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {aps.map((ap, i) => (
                    <Button
                      key={ap.id}
                      variant={ap.id === selectedAp.id ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setSelectedApId(ap.id)}
                    >
                      AP{i + 1}
                    </Button>
                  ))}
                </div>
                <Slider
                  label="Kuota yang dipancarkan"
                  value={selectedAp.rateMbps ?? DEFAULT_AP_RATE}
                  min={0}
                  max={1000}
                  step={10}
                  unit="Mbps"
                  digits={0}
                  onChange={(v) => setApRate(selectedAp.id, v)}
                />
                <p className="text-xs leading-relaxed text-faint">
                  Kuota dibagi rata ke semua penerima yang terhubung ke AP ini, dan waktu udara juga dibagi rata.
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted">Taruh satu AP dulu dengan alat "+ AP" untuk mengatur kuotanya.</p>
            )}
          </Card>

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
                Model multi-dinding: rugi ruang bebas ditambah rugi tiap dinding yang dilewati garis lurus dari AP ke titik. Warna mengikuti kekuatan sinyal yang sudah memperhitungkan jarak dan dinding. Semua AP memakai EIRP dari sidebar.
              </p>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
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
              <p className="text-sm leading-relaxed text-muted">Taruh minimal satu AP dengan alat "+ AP" untuk melihat peta sinyal.</p>
            )}
          </Card>

          <Card title="Penerima">
            {clients.length === 0 ? (
              <p className="text-sm leading-relaxed text-muted">
                Taruh HP, laptop, atau PC dengan alat "+ Penerima" untuk melihat kecepatan yang sampai dari AP.
              </p>
            ) : (
              <ul>
                {clients.map((client, i) => {
                  const res = results[i];
                  return (
                    <li key={client.id} className="border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-ink">{clientLabel(clients, i)}</span>
                        <span className="num text-sm text-ink">
                          {res.connected ? formatRate(res.deliveredMbps) : "Tidak terhubung"}
                        </span>
                      </div>
                      {res.connected ? (
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
                          <dt>Terhubung ke</dt>
                          <dd className="num text-right text-ink">AP{res.apIndex + 1}</dd>
                          <dt>Sinyal / SNR</dt>
                          <dd className="num text-right text-ink">
                            {res.rxDbm.toFixed(0)} dBm / {res.snrDb.toFixed(0)} dB
                          </dd>
                          <dt>Kapasitas link</dt>
                          <dd className="num text-right text-ink">{formatRate(res.linkMbps)}</dd>
                          <dt>Paket sampai</dt>
                          <dd className="num text-right text-ink">
                            {res.deliveryPct === null ? "-" : `${res.deliveryPct.toFixed(0)}%`}
                          </dd>
                        </dl>
                      ) : (
                        <p className="mt-1 text-xs text-muted">
                          Sinyal {Number.isFinite(res.rxDbm) ? `${res.rxDbm.toFixed(0)} dBm` : "tidak ada"}, di bawah sensitivitas atau SNR terlalu rendah.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-4 text-xs leading-relaxed text-faint">
              Kapasitas link dihitung dari SNR (lihat tab Alat). HP dianggap 1 stream, laptop dan PC 2 stream. Paket sampai adalah kapasitas dibanding kuota AP.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
