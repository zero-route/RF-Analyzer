"use client";

import { useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import { useFloorplanStore } from "@/store/useFloorplanStore";
import { classifyEirp, computeEirp } from "@/lib/rf/eirp";
import { computeLinkBudget, maxRangeM } from "@/lib/rf/linkBudget";
import { describeStatus } from "@/lib/rf/statusInfo";
import { pathExponent, totalObstructionDb, wallLossDb } from "@/lib/rf/propagation";
import { safeDistanceM } from "@/lib/rf/exposure";
import { EXPOSURE_LIMITS, findLimit, getRegion } from "@/lib/data/regulations";
import { noiseFloorDbm } from "@/lib/rf/tools";
import { estimateRate, formatRate } from "@/lib/rf/throughput";
import { dbmToMw } from "@/lib/rf/units";
import { clientLabel, computeClients, computeHeatmap, legendItems, resolveAps } from "@/lib/rf/floorplan";
import { floorplanDataUrl } from "@/lib/utils/exportFloorplan";
import { formatLength, formatPower } from "@/lib/utils/format";

function Section({ title, children }) {
  return (
    <section className="avoid-break mt-7">
      <h2 className="border-b border-line pb-1.5 text-base font-semibold text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Rows({ rows }) {
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-1.5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted">{label}</dt>
          <dd className="num text-right text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const signed = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} dB`;
const ANTENNA_NAMES = { omni: "Omni", sector: "Sektoral", directional: "Direksional" };
const ENVIRONMENT_NAMES = { free: "Ruang bebas", outdoor: "Luar ruangan", indoor: "Dalam ruangan" };

export default function ReportView({ state }) {
  const { widthM, heightM, walls, aps, clients } = useFloorplanStore();

  useEffect(() => {
    useFloorplanStore.persist.rehydrate();
  }, []);

  const region = getRegion(state.region);
  const eirp = computeEirp(state);
  const status = classifyEirp(eirp.eirpDbm, state.isolated);
  const info = describeStatus(status.level, eirp.eirpDbm);
  const obstruction = totalObstructionDb(state);
  const exponent = pathExponent(state);
  const params = {
    eirpDbm: eirp.eirpDbm,
    freqMHz: state.freqMHz,
    obstructionDb: obstruction,
    rxGainDbi: state.rxGainDbi,
    rxCableLossDb: state.rxCableLossDb,
    fadeMarginDb: state.fadeMarginDb,
    rxSensitivityDbm: state.rxSensitivityDbm,
    pathExponent: exponent,
  };
  const link = computeLinkBudget({ ...params, distanceM: state.distanceM });
  const range = maxRangeM(params);
  const limit = findLimit(region, state, state.freqMHz);
  const snr = link.rxPowerDbm - noiseFloorDbm(state.bandwidthMHz, state.noiseFigureDb);
  const rate = estimateRate(snr, state.bandwidthMHz, 2);

  const plan = useMemo(() => {
    if (aps.length === 0) return null;
    const resolved = resolveAps(aps, state.freqMHz);
    const rf = {
      eirpDbm: eirp.eirpDbm,
      freqMHz: state.freqMHz,
      rxGainDbi: state.rxGainDbi,
      rxCableLossDb: state.rxCableLossDb,
      sensitivityDbm: state.rxSensitivityDbm,
      bandwidthMHz: state.bandwidthMHz,
    };
    const heat = computeHeatmap({ walls, aps: resolved, widthM, heightM, ...rf });
    const results = computeClients({ clients, aps: resolved, walls, noiseFigureDb: state.noiseFigureDb, ...rf });
    const image = floorplanDataUrl({
      widthM,
      heightM,
      walls,
      aps: resolved,
      clients,
      heat,
      results,
      legend: legendItems(state.rxSensitivityDbm),
      info: `${state.freqMHz} MHz · EIRP ${eirp.eirpDbm.toFixed(1)} dBm · ${aps.length} AP · ${clients.length} penerima`,
      showInterference: aps.length > 1,
    });
    return { heat, results, image };
  }, [aps, clients, walls, widthM, heightM, eirp.eirpDbm, state]);

  const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="print-page mx-auto max-w-3xl bg-surface px-6 pb-16 pt-6 text-ink">
      <div className="no-print sticky top-0 z-10 -mx-6 mb-6 flex items-center justify-between gap-3 border-b border-line bg-surface px-6 py-3">
        <p className="text-sm text-muted">Pratinjau laporan. Pilih "Simpan sebagai PDF" di jendela cetak.</p>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => window.print()}>
            Cetak / simpan PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.close()}>
            Tutup
          </Button>
        </div>
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Laporan perhitungan EIRP</h1>
        <p className="mt-1 text-sm text-muted">{date} · Wilayah acuan: {region.label}</p>
      </header>

      <Section title="Masukan">
        <Rows
          rows={[
            ["Daya pemancar", `${state.txDbm.toFixed(1)} dBm (${formatPower(dbmToMw(state.txDbm))})`],
            ["Antena", `${ANTENNA_NAMES[state.antennaType]}, ${state.gainDbi.toFixed(1)} dBi × ${eirp.antCount}`],
            ["Rugi kabel TX", `${state.cableLossDb.toFixed(1)} dB`],
            ["Frekuensi", `${state.freqMHz} MHz`],
            ["Jarak link", formatLength(state.distanceM)],
            ["Lingkungan", `${ENVIRONMENT_NAMES[state.environment]} (n = ${exponent.toFixed(1)})`],
            ["Rugi dinding", `${wallLossDb(state).toFixed(1)} dB`],
            ["Halangan lain", `${state.obstructionDb.toFixed(1)} dB`],
            ["Gain / rugi kabel RX", `${state.rxGainDbi.toFixed(1)} dBi / ${state.rxCableLossDb.toFixed(1)} dB`],
            ["Sensitivitas / fade margin", `${state.rxSensitivityDbm} dBm / ${state.fadeMarginDb} dB`],
          ]}
        />
      </Section>

      <Section title="Hasil EIRP">
        <Rows
          rows={[
            ["EIRP", `${eirp.eirpDbm.toFixed(1)} dBm (${formatPower(dbmToMw(eirp.eirpDbm))})`],
            ["Status", status.label],
            ["Daya per antena", `${eirp.perAntennaDbm.toFixed(1)} dBm`],
            ["Gain susunan", `${eirp.arrayGainDb.toFixed(1)} dB`],
          ]}
        />
        <p className="mt-3 text-sm font-medium text-ink">{info.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{info.body}</p>
      </Section>

      <Section title="Link budget">
        <Rows
          rows={[
            ["Rugi lintasan", `${link.pathLossDb.toFixed(1)} dB`],
            ["Total halangan", `${obstruction.toFixed(1)} dB`],
            ["Daya terima", `${link.rxPowerDbm.toFixed(1)} dBm`],
            ["Margin setelah fade", signed(link.marginDb)],
            ["Jangkauan maksimum", Number.isFinite(range) && range <= 100000 ? formatLength(range) : "> 100 km"],
          ]}
        />
      </Section>

      <Section title="Kecepatan perkiraan">
        <Rows
          rows={[
            ["SNR (lebar kanal " + state.bandwidthMHz + " MHz)", `${snr.toFixed(1)} dB`],
            ["Modulasi", rate ? rate.name : "Tidak terhubung"],
            ["Throughput nyata (2 stream)", rate ? formatRate(rate.realMbps) : "-"],
          ]}
        />
      </Section>

      <Section title="Aturan dan keselamatan">
        <Rows
          rows={[
            [
              "Batas acuan EIRP",
              limit ? `${limit.limitDbm.toFixed(1)} dBm (${limit.label})` : "Tanpa acuan di profil ini",
            ],
            ["Selisih dengan EIRP", limit ? signed(limit.limitDbm - eirp.eirpDbm) : "-"],
            ...EXPOSURE_LIMITS.map((l) => [
              `Jarak aman paparan, ${l.label.toLowerCase()} (${l.limitWm2} W/m²)`,
              formatLength(safeDistanceM(eirp.eirpDbm, l.limitWm2)),
            ]),
          ]}
        />
        <p className="mt-3 text-xs leading-relaxed text-faint">{region.note}</p>
      </Section>

      {plan && (
        <Section title="Denah dan peta sinyal">
          <img src={plan.image} alt="Denah ruangan dengan peta sinyal" className="w-full rounded border border-line" />
          <div className="mt-3">
            <Rows
              rows={[
                ["Ukuran ruangan", `${widthM} × ${heightM} m`],
                ["Jumlah AP", String(aps.length)],
                ["Area tercakup", `${plan.heat.stats.coveragePct.toFixed(0)}%`],
                ["Area sinyal kuat", `${plan.heat.stats.goodPct.toFixed(0)}%`],
                ...(aps.length > 1 ? [["Area terganggu antar-AP", `${plan.heat.stats.interferencePct.toFixed(0)}%`]] : []),
              ]}
            />
          </div>
          {clients.length > 0 && (
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th className="py-1.5 font-normal">Penerima</th>
                  <th className="py-1.5 font-normal">AP</th>
                  <th className="py-1.5 text-right font-normal">Sinyal</th>
                  <th className="py-1.5 text-right font-normal">Diterima</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, i) => {
                  const res = plan.results[i];
                  return (
                    <tr key={client.id} className="border-b border-line last:border-b-0">
                      <td className="py-1.5">{clientLabel(clients, i)}</td>
                      <td className="py-1.5">{res.connected ? `AP${res.apIndex + 1}` : "-"}</td>
                      <td className="num py-1.5 text-right">
                        {Number.isFinite(res.rxDbm) ? `${res.rxDbm.toFixed(0)} dBm` : "-"}
                      </td>
                      <td className="num py-1.5 text-right">
                        {res.connected ? formatRate(res.deliveredMbps) : "Tidak terhubung"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>
      )}

      <p className="mt-8 border-t border-line pt-4 text-xs leading-relaxed text-faint">
        Semua angka adalah perkiraan untuk perencanaan, bukan pengukuran. Nilai redaman dinding, ambang kecepatan, dan batas aturan perlu diverifikasi sebelum dijadikan dasar keputusan, izin, atau keselamatan.
      </p>
    </main>
  );
}
