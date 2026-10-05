"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ChannelChart from "@/components/channel/ChannelChart";
import { useCalcStore } from "@/store/useCalcStore";
import { CHANNEL_BANDS, bandForFreq, buildChannels, channelAt } from "@/lib/data/channels";
import { getRegion } from "@/lib/data/regulations";

export default function ChannelTab() {
  const freqMHz = useCalcStore((s) => s.freqMHz);
  const update = useCalcStore((s) => s.update);
  const regionId = useCalcStore((s) => s.region);
  const [bandChoice, setBandChoice] = useState(null);
  const [widthChoice, setWidthChoice] = useState(20);

  const bandId = bandChoice ?? bandForFreq(freqMHz);
  const band = CHANNEL_BANDS.find((b) => b.id === bandId);
  const width = band.widths.includes(widthChoice) ? widthChoice : 20;
  const channels = buildChannels(band.id, width, getRegion(regionId));
  const current = channelAt(channels, freqMHz);
  const dfsCount = channels.filter((c) => c.dfs).length;
  const clearCount = channels.filter((c) => c.clear).length;

  return (
    <Card title="Perencana kanal">
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SegmentedControl
            label="Pita"
            options={CHANNEL_BANDS.map((b) => ({ value: b.id, label: b.label }))}
            value={band.id}
            onChange={setBandChoice}
          />
          <SegmentedControl
            label="Lebar kanal (MHz)"
            options={band.widths.map((w) => ({ value: w, label: String(w) }))}
            value={width}
            onChange={setWidthChoice}
          />
        </div>

        <ChannelChart
          band={band}
          channels={channels}
          freqMHz={freqMHz}
          onSelect={(channel) => update({ freqMHz: channel.centerMHz })}
        />
        <p className="-mt-2 text-xs text-faint">Ketuk sebuah kanal untuk mengisi frekuensi kalkulator. Geser ke samping bila grafik terpotong.</p>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr_auto_1fr]">
          <dt className="text-muted">Frekuensi aktif</dt>
          <dd className="num text-ink">{freqMHz} MHz</dd>
          <dt className="text-muted">Kanal aktif</dt>
          <dd className="num text-ink">{current ? current.label : "di luar kanal"}</dd>
          <dt className="text-muted">Jumlah kanal</dt>
          <dd className="num text-ink">{channels.length}</dd>
          <dt className="text-muted">{band.id === "24" ? "Bebas tumpang tindih" : "Kanal DFS"}</dt>
          <dd className="num text-ink">{band.id === "24" ? clearCount : dfsCount}</dd>
        </dl>

        <p className="border-t border-line pt-4 text-xs leading-relaxed text-faint">
          {band.note} Rencana kanal bersifat umum, ketersediaan sebenarnya bergantung pada aturan negara.
        </p>
      </div>
    </Card>
  );
}
