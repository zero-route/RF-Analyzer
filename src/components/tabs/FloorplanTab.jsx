"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import SegmentedControl from "@/components/ui/SegmentedControl";
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
  resolveAps,
  wallLossFor,
} from "@/lib/rf/floorplan";
import { assignChannels, suggestApPositions } from "@/lib/rf/autoPlace";
import { formatRate } from "@/lib/rf/throughput";
import { bandForFreq, buildChannels } from "@/lib/data/channels";
import { SAMPLE_PLANS } from "@/lib/data/samplePlans";
import { exportFloorplanPng } from "@/lib/utils/exportFloorplan";

const TOOLS = [
  { id: "select", label: "Geser" },
  { id: "wall", label: "Dinding" },
  { id: "ap", label: "+ AP" },
  { id: "client", label: "+ Penerima" },
  { id: "erase", label: "Hapus" },
];

const HINTS = {
  select: "Seret AP atau penerima untuk memindahkan. Ketuk AP untuk memilihnya dan mengatur kuota serta kanalnya.",
  wall: "Seret di denah untuk menggambar dinding. Panjangnya tampil saat menggambar.",
  ap: "Ketuk denah untuk menaruh access point (maksimal 6).",
  client: "Ketuk denah untuk menaruh penerima: HP, laptop, atau PC (maksimal 8).",
  erase: "Ketuk dinding, AP, atau penerima untuk menghapusnya.",
};

const selectClass = "h-8 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink sm:w-56";
const fullSelectClass = "h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink";
const AUTO_COUNTS = [1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }));

export default function FloorplanTab() {
  const { state, eirp } = useRfModel();
  const bandwidthMHz = useCalcStore((s) => s.bandwidthMHz);
  const noiseFigureDb = useCalcStore((s) => s.noiseFigureDb);
  const store = useFloorplanStore();
  const { widthM, heightM, walls, aps, clients, past, future } = store;
  const [tool, setTool] = useState("wall");
  const [wallType, setWallType] = useState("wallBrick");
  const [clientKind, setClientKind] = useState("hp");
  const [selectedApId, setSelectedApId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [autoCount, setAutoCount] = useState(2);
  const [autoMsg, setAutoMsg] = useState("");
  const [sampleId, setSampleId] = useState(SAMPLE_PLANS[0].id);

  useEffect(() => {
    useFloorplanStore.persist.rehydrate();
  }, []);

  const resolvedAps = useMemo(() => resolveAps(aps, state.freqMHz), [aps, state.freqMHz]);
  const channelOptions = useMemo(() => buildChannels(bandForFreq(state.freqMHz), 20), [state.freqMHz]);
  const selectedAp = aps.find((a) => a.id === selectedApId) ?? aps[0] ?? null;
  const selectedResolved = selectedAp ? resolvedAps.find((a) => a.id === selectedAp.id) : null;

  const rf = {
    eirpDbm: eirp.eirpDbm,
    freqMHz: state.freqMHz,
    rxGainDbi: state.rxGainDbi,
    rxCableLossDb: state.rxCableLossDb,
    sensitivityDbm: state.rxSensitivityDbm,
  };

  const heat = useMemo(
    () => computeHeatmap({ walls, aps: resolvedAps, widthM, heightM, bandwidthMHz, ...rf }),
    [walls, resolvedAps, widthM, heightM, bandwidthMHz, rf.eirpDbm, rf.freqMHz, rf.rxGainDbi, rf.rxCableLossDb, rf.sensitivityDbm]
  );

  const results = useMemo(
    () => computeClients({ clients, aps: resolvedAps, walls, bandwidthMHz, noiseFigureDb, ...rf }),
    [clients, resolvedAps, walls, bandwidthMHz, noiseFigureDb, rf.eirpDbm, rf.freqMHz, rf.rxGainDbi, rf.rxCableLossDb, rf.sensitivityDbm]
  );

  const showInterference = aps.length > 1;

  function runAutoPlace() {
    const positions = suggestApPositions({ walls, widthM, heightM, count: autoCount, ...rf });
    const before = heat.stats ? heat.stats.goodPct : 0;
    const candidate = resolveAps(
      positions.map((p, i) => ({ ...p, rateMbps: aps[i]?.rateMbps ?? DEFAULT_AP_RATE, chMHz: aps[i]?.chMHz ?? null })),
      state.freqMHz
    );
    const after = computeHeatmap({ walls, aps: candidate, widthM, heightM, bandwidthMHz, ...rf }).stats.goodPct;
    store.setApPositions(positions);
    setAutoMsg(`Area sinyal kuat: ${before.toFixed(0)}% menjadi ${after.toFixed(0)}%`);
  }

  function runAutoChannels() {
    store.setApChannels(assignChannels(aps, state.freqMHz, bandwidthMHz));
  }

  function savePng() {
    exportFloorplanPng({
      widthM,
      heightM,
      walls,
      aps: resolvedAps,
      clients,
      heat,
      results,
      legend: legendItems(state.rxSensitivityDbm),
      info: `${state.freqMHz} MHz · EIRP ${eirp.eirpDbm.toFixed(1)} dBm · ${aps.length} AP · ${clients.length} penerima`,
      showInterference,
    });
  }

  function loadSample() {
    const plan = SAMPLE_PLANS.find((p) => p.id === sampleId);
    if (plan) {
      store.loadPlan(plan);
      setSelectedApId(null);
      setAutoMsg("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          expanded ? "fixed inset-0 z-50 overflow-auto bg-bg p-4" : "rounded-lg border border-line bg-surface p-4"
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted">
              Denah ruangan <span className="num ml-2 text-faint">{widthM} × {heightM} m</span>
            </h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={store.undo} disabled={past.length === 0}>
                Urungkan
              </Button>
              <Button variant="secondary" size="sm" onClick={store.redo} disabled={future.length === 0}>
                Ulangi
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setExpanded((v) => !v)}>
                {expanded ? "Tutup" : "Perbesar"}
              </Button>
            </div>
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
              <select aria-label="Bahan dinding" value={wallType} onChange={(e) => setWallType(e.target.value)} className={selectClass}>
                {WALL_TYPES.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.label} ({wallLossFor(w.key, state.freqMHz)} dB)
                  </option>
                ))}
              </select>
            )}
            {tool === "client" && (
              <select aria-label="Jenis penerima" value={clientKind} onChange={(e) => setClientKind(e.target.value)} className={selectClass}>
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

          <ul className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs text-muted sm:grid-cols-3">
            {legendItems(state.rxSensitivityDbm).map((item) => (
              <li key={item.level} className="flex items-center gap-2">
                <span className="h-3 w-5 shrink-0 rounded-sm border border-line" style={{ background: LEVEL_COLORS[item.level] }} />
                <span className="num">{item.label}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="h-3 w-5 shrink-0 rounded-sm border border-line bg-surface" />
              <span>Tanpa sinyal</span>
            </li>
            {showInterference && (
              <li className="flex items-center gap-2">
                <span
                  className="h-3 w-5 shrink-0 rounded-sm border border-line"
                  style={{ background: "repeating-conic-gradient(rgba(0,0,0,0.5) 0% 25%, transparent 0% 50%) 0 0 / 6px 6px" }}
                />
                <span>Interferensi antar-AP</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card title="Access point">
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
                  onChange={(v) => store.setApRate(selectedAp.id, v)}
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ap-channel" className="text-sm text-muted">
                    Kanal (20 MHz)
                  </label>
                  <select
                    id="ap-channel"
                    value={selectedResolved?.chMHz}
                    onChange={(e) => store.setApChannel(selectedAp.id, Number(e.target.value))}
                    className={fullSelectClass}
                  >
                    {channelOptions.map((c) => (
                      <option key={c.key} value={c.centerMHz}>
                        Kanal {c.label} ({c.centerMHz} MHz)
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="secondary" size="sm" onClick={runAutoChannels} className="self-start" disabled={aps.length < 2}>
                  Atur kanal otomatis
                </Button>
                <p className="text-xs leading-relaxed text-faint">
                  Kuota dibagi rata ke penerima yang terhubung, dan waktu udara juga dibagi rata. AP dengan kuota 0 dianggap tidak memancar. Dua AP di kanal sama atau berdekatan saling mengganggu dan menurunkan kecepatan penerima.
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted">Taruh satu AP dulu dengan alat "+ AP" untuk mengatur kuota dan kanalnya.</p>
            )}
          </Card>

          <Card title="Saran posisi AP">
            <div className="flex flex-col gap-4">
              <SegmentedControl label="Jumlah AP" options={AUTO_COUNTS} value={autoCount} onChange={setAutoCount} />
              <Button variant="primary" size="sm" onClick={runAutoPlace} className="self-start">
                Hitung dan terapkan
              </Button>
              {autoMsg && <p className="num text-sm text-ink">{autoMsg}</p>}
              <p className="text-xs leading-relaxed text-faint">
                Mencari posisi yang membuat area sinyal kuat paling luas dengan dinding yang sudah digambar. Posisi AP lama diganti, tapi bisa diurungkan.
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
                {showInterference && (
                  <>
                    <dt className="text-muted">Area terganggu antar-AP</dt>
                    <dd className="num text-right text-ink">{heat.stats.interferencePct.toFixed(0)}%</dd>
                  </>
                )}
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
                        <span className="num text-sm text-ink">{res.connected ? formatRate(res.deliveredMbps) : "Tidak terhubung"}</span>
                      </div>
                      {res.connected ? (
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
                          <dt>Terhubung ke</dt>
                          <dd className="num text-right text-ink">AP{res.apIndex + 1}</dd>
                          <dt>Sinyal / SINR</dt>
                          <dd className="num text-right text-ink">
                            {res.rxDbm.toFixed(0)} dBm / {res.snrDb.toFixed(0)} dB
                          </dd>
                          <dt>Kapasitas link</dt>
                          <dd className="num text-right text-ink">{formatRate(res.linkMbps)}</dd>
                          <dt>Paket sampai</dt>
                          <dd className="num text-right text-ink">{res.deliveryPct === null ? "-" : `${res.deliveryPct.toFixed(0)}%`}</dd>
                        </dl>
                      ) : (
                        <p className="mt-1 text-xs text-muted">
                          Sinyal {Number.isFinite(res.rxDbm) ? `${res.rxDbm.toFixed(0)} dBm` : "tidak ada"}, di bawah sensitivitas atau SINR terlalu rendah.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-4 text-xs leading-relaxed text-faint">
              Kapasitas link dihitung dari SINR (SNR ditambah interferensi antar-AP). HP dianggap 1 stream, laptop dan PC 2 stream. Paket sampai adalah kapasitas dibanding kuota AP.
            </p>
          </Card>

          <Card title="Denah dan ekspor">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Lebar" unit="m" value={widthM} min={3} max={60} step={0.5} onChange={(v) => store.setSize(v, heightM)} />
                <NumberField label="Panjang" unit="m" value={heightM} min={3} max={60} step={0.5} onChange={(v) => store.setSize(widthM, v)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => store.addOuterWalls(wallType)}>
                  Dinding luar
                </Button>
                <Button variant="secondary" size="sm" onClick={savePng}>
                  Simpan sebagai PNG
                </Button>
                <Button variant="ghost" size="sm" onClick={store.clear}>
                  Hapus semua
                </Button>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-line pt-4">
                <label htmlFor="sample-plan" className="text-sm text-muted">
                  Denah contoh
                </label>
                <div className="flex gap-2">
                  <select id="sample-plan" value={sampleId} onChange={(e) => setSampleId(e.target.value)} className={fullSelectClass}>
                    {SAMPLE_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <Button variant="secondary" size="md" onClick={loadSample}>
                    Muat
                  </Button>
                </div>
                <p className="text-xs leading-relaxed text-faint">Memuat denah contoh menggantikan denah sekarang, tapi bisa diurungkan.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
