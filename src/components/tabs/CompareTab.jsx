"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { DEFAULTS, useCalcStore } from "@/store/useCalcStore";
import { useSavedProfiles } from "@/hooks/useSavedProfiles";
import { computeScenario } from "@/lib/rf/scenario";
import { sanitizeState } from "@/lib/utils/shareState";
import { formatLength, formatPower } from "@/lib/utils/format";

const MAX_SELECTED = 3;

const signed = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} dB`;

const ROWS = [
  { label: "Frekuensi", get: (s) => `${s.freqMHz} MHz` },
  { label: "Antena", get: (s) => `${s.gainDbi.toFixed(1)} dBi × ${s.antCount}` },
  { label: "EIRP", get: (s) => `${s.eirpDbm.toFixed(1)} dBm`, strong: true },
  { label: "Daya setara", get: (s) => formatPower(s.eirpMw) },
  { label: "Status", get: (s) => s.status.label },
  { label: "Jarak link", get: (s) => formatLength(s.distanceM) },
  { label: "Daya terima", get: (s) => `${s.rxPowerDbm.toFixed(1)} dBm`, strong: true },
  { label: "Margin link", get: (s) => signed(s.marginDb) },
  {
    label: "Jangkauan maks",
    get: (s) => (Number.isFinite(s.rangeM) && s.rangeM <= 100000 ? formatLength(s.rangeM) : "> 100 km"),
  },
  { label: "Jarak aman publik", get: (s) => formatLength(s.safeDistanceM) },
];

export default function CompareTab() {
  const state = useCalcStore();
  const { profiles } = useSavedProfiles();
  const [selected, setSelected] = useState([]);

  function toggle(id) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      if (current.length >= MAX_SELECTED) return current;
      return [...current, id];
    });
  }

  const columns = [
    { id: "current", name: "Saat ini", scenario: computeScenario(state) },
    ...profiles
      .filter((p) => selected.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        scenario: computeScenario({ ...DEFAULTS, ...sanitizeState(p.data) }),
      })),
  ];

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <Card title="Pilih profil">
        {profiles.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted">
            Belum ada profil tersimpan. Atur input di sidebar, lalu simpan lewat kartu Profil dan bagikan.
          </p>
        ) : (
          <>
            <ul>
              {profiles.map((profile) => {
                const checked = selected.includes(profile.id);
                const locked = !checked && selected.length >= MAX_SELECTED;
                return (
                  <li key={profile.id} className="border-b border-line last:border-b-0">
                    <label
                      className={`flex items-center gap-3 py-2.5 text-sm ${
                        locked ? "cursor-not-allowed text-faint" : "cursor-pointer text-ink"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={locked}
                        onChange={() => toggle(profile.id)}
                        className="h-4 w-4 accent-accent"
                      />
                      <span className="min-w-0 truncate">{profile.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-faint">Maksimal {MAX_SELECTED} profil dibandingkan dengan kondisi saat ini.</p>
          </>
        )}
      </Card>

      <Card title="Perbandingan">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-2 pr-4 text-left font-normal text-faint" />
                {columns.map((col) => (
                  <th key={col.id} className="max-w-[9rem] truncate px-3 py-2 text-right font-medium text-ink">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <td className="py-2 pr-4 text-muted">{row.label}</td>
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={`num px-3 py-2 text-right ${row.strong ? "font-medium text-ink" : "text-ink"}`}
                    >
                      {row.get(col.scenario)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
