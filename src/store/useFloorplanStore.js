import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_WALLS = 80;
const MAX_APS = 6;
let counter = 0;
const uid = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export const useFloorplanStore = create(
  persist(
    (set) => ({
      widthM: 12,
      heightM: 8,
      walls: [],
      aps: [],
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
        set((s) => (s.aps.length >= MAX_APS ? s : { aps: [...s.aps, { id: uid(), x, y }] })),
      moveAp: (id, x, y) => set((s) => ({ aps: s.aps.map((a) => (a.id === id ? { ...a, x, y } : a)) })),
      removeAp: (id) => set((s) => ({ aps: s.aps.filter((a) => a.id !== id) })),
      clear: () => set({ walls: [], aps: [] }),
    }),
    {
      name: "eirp-floorplan",
      skipHydration: true,
      partialize: (s) => ({ widthM: s.widthM, heightM: s.heightM, walls: s.walls, aps: s.aps }),
    }
  )
);
