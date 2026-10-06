"use client";

import Badge from "@/components/ui/Badge";
import PropagationInput from "@/components/controls/PropagationInput";
import Card from "@/components/ui/Card";
import NumberField from "@/components/ui/NumberField";
import Slider from "@/components/ui/Slider";
import LinkBudgetWaterfall from "@/components/charts/LinkBudgetWaterfall";
import RxVsDistance from "@/components/charts/RxVsDistance";
import { useCalcStore } from "@/store/useCalcStore";
import { useRfModel } from "@/hooks/useRfModel";
import { RECEIVERS } from "@/lib/data/receivers";
import { formatDistance } from "@/lib/utils/format";

function rangeText(range) {
  if (!Number.isFinite(range) || range > 100000) return "> 100 km";
  return formatDistance(range);
}

export default function LinkBudgetTab() {
  const update = useCalcStore((s) => s.update);
  const { state, link, range } = useRfModel();
  const ok = link.marginDb >= 0;

  function applyReceiver(id) {
    const receiver = RECEIVERS.find((r) => r.id === id);
    if (receiver) update({ rxSensitivityDbm: receiver.sensitivityDbm });
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <PropagationInput />
        <Card title="Parameter link">
          <div className="grid gap-5">
            <NumberField
              label="Jarak"
              unit="m"
              value={state.distanceM}
              min={0.5}
              max={50000}
              step={1}
              onChange={(v) => update({ distanceM: v })}
            />
            <Slider
              label="Halangan lain"
              value={state.obstructionDb}
              min={0}
              max={40}
              step={0.5}
              unit="dB"
              onChange={(v) => update({ obstructionDb: v })}
            />
            <Slider
              label="Gain antena RX"
              value={state.rxGainDbi}
              min={0}
              max={30}
              step={0.5}
              unit="dBi"
              onChange={(v) => update({ rxGainDbi: v })}
            />
            <Slider
              label="Rugi kabel RX"
              value={state.rxCableLossDb}
              min={0}
              max={10}
              step={0.1}
              unit="dB"
              onChange={(v) => update({ rxCableLossDb: v })}
            />
            <Slider
              label="Fade margin"
            tip="fade"
              value={state.fadeMarginDb}
              min={0}
              max={30}
              step={1}
              unit="dB"
              digits={0}
              onChange={(v) => update({ fadeMarginDb: v })}
            />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="receiver" className="text-sm text-muted">
                  Preset sensitivitas RX
                </label>
                <select
                  id="receiver"
                  defaultValue=""
                  onChange={(e) => applyReceiver(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink"
                >
                  <option value="" disabled>
                    Pilih preset
                  </option>
                  {RECEIVERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} ({r.sensitivityDbm} dBm)
                    </option>
                  ))}
                </select>
              </div>
              <NumberField
                label="Sensitivitas RX"
              tip="sensitivity"
                unit="dBm"
                value={state.rxSensitivityDbm}
                min={-110}
                max={-40}
                step={1}
                onChange={(v) => update({ rxSensitivityDbm: v })}
              />
            </div>
          </div>
        </Card>

        <Card
          title="Hasil"
          action={
            <Badge tone={ok ? "safe" : "danger"}>{ok ? "Link memadai" : "Di bawah sensitivitas"}</Badge>
          }
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted">Daya terima</dt>
            <dd className="num text-right text-ink">{link.rxPowerDbm.toFixed(1)} dBm</dd>
            <dt className="text-muted">Rugi lintasan</dt>
            <dd className="num text-right text-ink">{link.pathLossDb.toFixed(1)} dB</dd>
            <dt className="text-muted">Margin (setelah fade)</dt>
            <dd className="num text-right text-ink">{link.marginDb.toFixed(1)} dB</dd>
            <dt className="text-muted">Jangkauan maksimum</dt>
            <dd className="num text-right text-ink">{rangeText(range)}</dd>
          </dl>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <LinkBudgetWaterfall />
        <RxVsDistance />
      </div>
    </div>
  );
}
