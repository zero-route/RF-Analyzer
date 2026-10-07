"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import { useNeighborStore } from "@/store/useNeighborStore";
import { rankChannels } from "@/lib/rf/channelPlan";

const selectClass = "h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink";

export default function NeighborPlanner({ band, channels, onPick }) {
  const { neighbors, add, update, remove, clear } = useNeighborStore();
  const [lo, hi] = band.rangeMHz;
  const inBand = neighbors.filter((n) => n.chMHz >= lo && n.chMHz <= hi);
  const hidden = neighbors.length - inBand.length;
  const ranked = rankChannels(channels, inBand).slice(0, 5);
  const best = ranked[0];

  return (
    <Card title="Saran kanal terbaik" tip="dfs">
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-muted">
          Masukkan Wi-Fi tetangga yang terdeteksi di ponsel atau laptopmu (kanal dan kekuatan sinyalnya), lalu web menunjuk kanal yang paling sepi.
        </p>

        {inBand.length > 0 && (
          <ul className="flex flex-col gap-3">
            {inBand.map((n) => (
              <li key={n.id} className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm text-muted">Kanal tetangga</span>
                  <select
                    aria-label="Kanal tetangga"
                    value={n.chMHz}
                    onChange={(e) => update(n.id, { chMHz: Number(e.target.value) })}
                    className={selectClass}
                  >
                    {channels.map((c) => (
                      <option key={c.key} value={c.centerMHz}>
                        Kanal {c.label} ({c.centerMHz} MHz)
                      </option>
                    ))}
                  </select>
                </div>
                <NumberField
                  label="Sinyal"
                  unit="dBm"
                  value={n.rssi}
                  min={-100}
                  max={-20}
                  step={1}
                  onChange={(v) => update(n.id, { rssi: v })}
                />
                <Button variant="ghost" size="md" onClick={() => remove(n.id)}>
                  Hapus
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => add(channels[0]?.centerMHz ?? lo)}>
            Tambah tetangga
          </Button>
          {neighbors.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Hapus semua
            </Button>
          )}
        </div>
        {hidden > 0 && <p className="text-xs text-faint">{hidden} tetangga di pita lain disembunyikan.</p>}

        {best && (
          <div className="border-t border-line pt-4">
            <p className="text-sm text-muted">
              {inBand.length === 0 ? "Belum ada tetangga, kanal paling bebas tumpang tindih:" : "Kanal paling sepi:"}
            </p>
            <ul className="mt-2">
              {ranked.map((r, i) => (
                <li key={r.channel.key} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
                  <div className="min-w-0">
                    <p className={`text-sm ${i === 0 ? "font-medium text-ink" : "text-muted"}`}>
                      Kanal {r.channel.label}
                      {i === 0 && <span className="ml-2 text-xs text-faint">terbaik</span>}
                    </p>
                    <p className="num text-xs text-faint">
                      {r.channel.centerMHz} MHz · {r.affecting} tetangga mengganggu ·{" "}
                      {r.interferenceDbm === null ? "tanpa interferensi" : `${r.interferenceDbm.toFixed(0)} dBm`}
                    </p>
                  </div>
                  <Button variant={i === 0 ? "primary" : "secondary"} size="sm" onClick={() => onPick(r.channel.centerMHz)}>
                    Pakai
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs leading-relaxed text-faint">
          Setiap tetangga dianggap selebar 20 MHz. Nilai interferensi adalah jumlah daya tetangga yang tumpang tindih dengan kanal itu, makin kecil makin baik.
        </p>
      </div>
    </Card>
  );
}
