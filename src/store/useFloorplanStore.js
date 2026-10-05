import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_WALLS = 80;
const MAX_APS = 6;
const MAX_CLIENTS = 8;
const MAX_HISTORY = 50;
const DEFAULT_RATE = 300;
let counter = 0;
const uid = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

const snap = (s) => ({
  widthM: s.widthM,
  heightM: s.heightM,
  walls: s.walls,
  aps: s.aps,
  clients: s.clients,
});

const record = (s, key = null) =>
  key && s.lastKey === key
    ? {}
    : { past: [...s.past, snap(s)].slice(-MAX_HISTORY), future: [], lastKey: key };

export const useFloorplanStore = create(
  persist(
    (set) => ({
      widthM: 12,
      heightM: 8,
      walls: [],
      aps: [],
      clients: [],
      past: [],
      future: [],
      lastKey: null,

      snapshot: () => set((s) => record(s)),
      undo: () =>
        set((s) => {
          if (s.past.length === 0) return s;
          const prev = s.past[s.past.length - 1];
          return { ...prev, past: s.past.slice(0, -1), future: [snap(s), ...s.future], lastKey: null };
        }),
      redo: () =>
        set((s) => {
          if (s.future.length === 0) return s;
          const next = s.future[0];
          return { ...next, past: [...s.past, snap(s)], future: s.future.slice(1), lastKey: null };
        }),

      setSize: (widthM, heightM) => set((s) => ({ ...record(s, "size"), widthM, heightM })),
      addWall: (wall) =>
        set((s) =>
          s.walls.length >= MAX_WALLS ? s : { ...record(s), walls: [...s.walls, { id: uid(), ...wall }] }
        ),
      addOuterWalls: (type) =>
        set((s) => {
          const { widthM: w, heightM: h } = s;
          const edges = [
            [0, 0, w, 0],
            [w, 0, w, h],
            [w, h, 0, h],
            [0, h, 0, 0],
          ].map(([x1, y1, x2, y2]) => ({ id: uid(), x1, y1, x2, y2, type }));
          return { ...record(s), walls: [...s.walls, ...edges].slice(0, MAX_WALLS) };
        }),
      removeWall: (id) => set((s) => ({ ...record(s), walls: s.walls.filter((w) => w.id !== id) })),

      addAp: (x, y) =>
        set((s) =>
          s.aps.length >= MAX_APS
            ? s
            : { ...record(s), aps: [...s.aps, { id: uid(), x, y, rateMbps: DEFAULT_RATE }] }
        ),
      moveAp: (id, x, y) => set((s) => ({ aps: s.aps.map((a) => (a.id === id ? { ...a, x, y } : a)) })),
      setApRate: (id, rateMbps) =>
        set((s) => ({
          ...record(s, `rate-${id}`),
          aps: s.aps.map((a) => (a.id === id ? { ...a, rateMbps } : a)),
        })),
      setApChannel: (id, chMHz) =>
        set((s) => ({ ...record(s), aps: s.aps.map((a) => (a.id === id ? { ...a, chMHz } : a)) })),
      setApChannels: (channels) =>
        set((s) => ({
          ...record(s),
          aps: s.aps.map((a, i) => (channels[i] !== undefined ? { ...a, chMHz: channels[i] } : a)),
        })),
      setApPositions: (positions) =>
        set((s) => ({
          ...record(s),
          aps: positions.slice(0, MAX_APS).map((p, i) =>
            s.aps[i]
              ? { ...s.aps[i], x: p.x, y: p.y }
              : { id: uid(), x: p.x, y: p.y, rateMbps: DEFAULT_RATE }
          ),
        })),
      removeAp: (id) => set((s) => ({ ...record(s), aps: s.aps.filter((a) => a.id !== id) })),

      addClient: (x, y, kind) =>
        set((s) =>
          s.clients.length >= MAX_CLIENTS
            ? s
            : { ...record(s), clients: [...s.clients, { id: uid(), x, y, kind }] }
        ),
      moveClient: (id, x, y) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, x, y } : c)) })),
      removeClient: (id) => set((s) => ({ ...record(s), clients: s.clients.filter((c) => c.id !== id) })),

      loadPlan: (plan) =>
        set((s) => ({
          ...record(s),
          widthM: plan.widthM,
          heightM: plan.heightM,
          walls: plan.walls.map((w) => ({ id: uid(), ...w })),
          aps: plan.aps.map((a) => ({ id: uid(), rateMbps: DEFAULT_RATE, ...a })),
          clients: plan.clients.map((c) => ({ id: uid(), ...c })),
        })),
      clear: () => set((s) => ({ ...record(s), walls: [], aps: [], clients: [] })),
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
