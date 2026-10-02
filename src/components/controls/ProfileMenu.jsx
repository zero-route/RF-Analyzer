"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useCalcStore } from "@/store/useCalcStore";
import { useSavedProfiles } from "@/hooks/useSavedProfiles";
import { pickShareState, sanitizeState, toSearchParams } from "@/lib/utils/shareState";

export default function ProfileMenu() {
  const state = useCalcStore();
  const update = useCalcStore((s) => s.update);
  const { profiles, save, remove } = useSavedProfiles();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?${toSearchParams(state)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Salin tautan ini", url);
    }
  }

  function handleSave() {
    if (save(name, pickShareState(state))) setName("");
  }

  return (
    <Card title="Profil dan bagikan">
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" onClick={copyLink} className="self-start">
          {copied ? "Tautan tersalin" : "Salin tautan"}
        </Button>

        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            maxLength={40}
            placeholder="Nama profil"
            aria-label="Nama profil"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="h-9 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-faint focus:border-accent"
          />
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim()}>
            Simpan
          </Button>
        </div>

        {profiles.length > 0 && (
          <ul className="border-t border-line pt-1">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex items-center justify-between gap-2 border-b border-line py-1.5 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => update(sanitizeState(profile.data))}
                  className="min-w-0 flex-1 truncate text-left text-sm text-ink hover:underline"
                >
                  {profile.name}
                </button>
                <Button variant="ghost" size="sm" onClick={() => remove(profile.id)}>
                  Hapus
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
