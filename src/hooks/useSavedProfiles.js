import { useMemo, useSyncExternalStore } from "react";

const KEY = "eirp-profiles";
const MAX_PROFILES = 20;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function read() {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function useSavedProfiles() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");

  const profiles = useMemo(() => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [raw]);

  function write(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    emit();
  }

  function save(name, data) {
    const trimmed = name.trim().slice(0, 40);
    if (!trimmed) return false;
    write([{ id: String(Date.now()), name: trimmed, data }, ...profiles].slice(0, MAX_PROFILES));
    return true;
  }

  function remove(id) {
    write(profiles.filter((profile) => profile.id !== id));
  }

  return { profiles, save, remove };
}
