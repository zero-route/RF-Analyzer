import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_WALLS = 80;
const MAX_APS = 6;
const MAX_CLIENTS = 8;
const DEFAULT_RATE = 300;
let counter = 0;
const uid = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export const useFloorplanStore = create(
  persist(
    (set) => ({
      widthM: 12,
      heightM: 8,
      walls: [],
      aps: [],
      clients: [],
      setSize: (widthM, heightM) => set({ widthM, heightM }),
      addWall: (wall) =>
        set((s) => (s.walls.length >= MAX_WALLS ? s : { walls: [...s.walls, { id: uid(), ...wall }] })),
      addOuterWalls: (type) =>
        set((s) => {
          const { widthM: w, heightM: h } = s;
          const edges = [
            [0, 0, w, 0],
            [w, 0, w, h],
            [w, h, 0, h],
            [0, h, 0, 0],
          ].map(([x1, y1, x2, y2]) => ({ id: uid(), x1, y1, x2, y2, type }));
          return { walls: [...s.walls, ...edges].slice(0, MAX_WALLS) };
        }),
      removeWall: (id) => set((s) => ({ walls: s.walls.filter((w) => w.id !== id) })),
      addAp: (x, y) =>
        set((s) =>
          s.aps.length >= MAX_APS ? s : { aps: [...s.aps, { id: uid(), x, y, rateMbps: DEFAULT_RATE }] }
        ),
      moveAp: (id, x, y) => set((s) => ({ aps: s.aps.map((a) => (a.id === id ? { ...a, x, y } : a)) })),
      setApRate: (id, rateMbps) =>
        set((s) => ({ aps: s.aps.map((a) => (a.id === id ? { ...a, rateMbps } : a)) })),
      removeAp: (id) => set((s) => ({ aps: s.aps.filter((a) => a.id !== id) })),
      addClient: (x, y, kind) =>
        set((s) =>
          s.clients.length >= MAX_CLIENTS ? s : { clients: [...s.clients, { id: uid(), x, y, kind }] }
        ),
      moveClient: (id, x, y) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, x, y } : c)) })),
      removeClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),
      clear: () => set({ walls: [], aps: [], clients: [] }),
    }),
    {
      name: "eirp-floorplan",
      skipHydration: true,
      partialize: (s) => ({
        widthM: s.widthM,
        heightM: s.heightM,
        walls: s.walls,
        aps: s.aps,
        clients: s.clients,
      }),
    }
  )
);
