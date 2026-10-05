const box = (w, h, type) => [
  { x1: 0, y1: 0, x2: w, y2: 0, type },
  { x1: w, y1: 0, x2: w, y2: h, type },
  { x1: w, y1: h, x2: 0, y2: h, type },
  { x1: 0, y1: h, x2: 0, y2: 0, type },
];

const line = (x1, y1, x2, y2, type) => ({ x1, y1, x2, y2, type });

export const SAMPLE_PLANS = [
  {
    id: "studio",
    label: "Apartemen studio (6 × 5 m)",
    widthM: 6,
    heightM: 5,
    walls: [
      ...box(6, 5, "wallBrick"),
      line(4, 0, 4, 2.5, "wallDrywall"),
      line(4, 2.5, 6, 2.5, "wallDrywall"),
    ],
    aps: [{ x: 1.5, y: 2.5 }],
    clients: [
      { x: 5, y: 4, kind: "laptop" },
      { x: 5, y: 1, kind: "hp" },
    ],
  },
  {
    id: "rumah",
    label: "Rumah 2 kamar (10 × 8 m)",
    widthM: 10,
    heightM: 8,
    walls: [
      ...box(10, 8, "wallBrick"),
      line(5, 0, 5, 2, "wallDrywall"),
      line(5, 3, 5, 5, "wallDrywall"),
      line(0, 5, 2, 5, "wallDrywall"),
      line(3, 5, 7, 5, "wallDrywall"),
      line(8, 5, 10, 5, "wallDrywall"),
    ],
    aps: [{ x: 5, y: 6.5 }],
    clients: [
      { x: 1.5, y: 1.5, kind: "hp" },
      { x: 8.5, y: 1.5, kind: "laptop" },
      { x: 8.5, y: 6.5, kind: "pc" },
    ],
  },
  {
    id: "kantor",
    label: "Kantor kecil (14 × 10 m)",
    widthM: 14,
    heightM: 10,
    walls: [
      ...box(14, 10, "wallBrick"),
      line(6, 3, 8, 3, "wallConcrete"),
      line(8, 3, 8, 7, "wallConcrete"),
      line(8, 7, 6, 7, "wallConcrete"),
      line(6, 7, 6, 3, "wallConcrete"),
      line(0, 6, 5, 6, "wallGlass"),
      line(5, 6, 5, 10, "wallGlass"),
    ],
    aps: [
      { x: 3, y: 3 },
      { x: 11, y: 7 },
    ],
    clients: [
      { x: 12, y: 2, kind: "pc" },
      { x: 2, y: 8, kind: "laptop" },
      { x: 10, y: 9, kind: "hp" },
    ],
  },
];
