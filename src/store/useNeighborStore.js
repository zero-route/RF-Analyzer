import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_NEIGHBORS = 24;
let counter = 0;
const uid = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export const useNeighborStore = create(
  persist(
    (set) => ({
      neighbors: [],
      add: (chMHz, rssi = -65) =>
        set((s) =>
          s.neighbors.length >= MAX_NEIGHBORS ? s : { neighbors: [...s.neighbors, { id: uid(), chMHz, rssi }] }
        ),
      update: (id, patch) =>
        set((s) => ({ neighbors: s.neighbors.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
      remove: (id) => set((s) => ({ neighbors: s.neighbors.filter((n) => n.id !== id) })),
      clear: () => set({ neighbors: [] }),
    }),
    {
      name: "eirp-neighbors",
      skipHydration: true,
      partialize: (s) => ({ neighbors: s.neighbors }),
    }
  )
);
