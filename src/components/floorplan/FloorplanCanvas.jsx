"use client";

import { useEffect, useRef, useState } from "react";
import { useFloorplanStore } from "@/store/useFloorplanStore";
import { LEVEL_T } from "@/lib/rf/floorplan";
import { rampColor } from "@/lib/utils/colorRamp";
import { clamp } from "@/lib/utils/clamp";

const SNAP = 0.5;
const snap = (v) => Math.round(v / SNAP) * SNAP;

const WALL_STYLE = {
  wallDrywall: { w: 1.5, dash: "5 3" },
  wallWood: { w: 2.5, dash: undefined },
  wallGlass: { w: 1.5, dash: "2 3" },
  wallBrick: { w: 3.5, dash: undefined },
  wallConcrete: { w: 5.5, dash: undefined },
};

export default function FloorplanCanvas({ tool, wallType, heat, dark }) {
  const { widthM: W, heightM: H, walls, aps, addWall, addAp, moveAp, removeWall, removeAp } = useFloorplanStore();
  const svgRef = useRef(null);
  const canvasRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = heat.cols;
    canvas.height = heat.rows;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, heat.cols, heat.rows);
    for (let r = 0; r < heat.rows; r += 1) {
      for (let c = 0; c < heat.cols; c += 1) {
        const level = heat.levels[r * heat.cols + c];
        if (level < 0) continue;
        ctx.fillStyle = rampColor(LEVEL_T[level], dark);
        ctx.fillRect(c, r, 1, 1);
      }
    }
  }, [heat, dark]);

  function toPoint(e) {
    const rect = svgRef.current.getBoundingClientRect();
    return [
      clamp(snap(((e.clientX - rect.left) / rect.width) * W), 0, W),
      clamp(snap(((e.clientY - rect.top) / rect.height) * H), 0, H),
    ];
  }

  function onDown(e) {
    if (tool === "wall") {
      const [x, y] = toPoint(e);
      svgRef.current.setPointerCapture(e.pointerId);
      setDraft({ x1: x, y1: y, x2: x, y2: y });
    } else if (tool === "ap") {
      const [x, y] = toPoint(e);
      addAp(x, y);
    }
  }

  function onMove(e) {
    if (tool === "wall" && draft) {
      const [x, y] = toPoint(e);
      setDraft({ ...draft, x2: x, y2: y });
    } else if (tool === "select" && dragId) {
      const [x, y] = toPoint(e);
      moveAp(dragId, x, y);
    }
  }

  function onUp() {
    if (draft) {
      if (Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1) >= SNAP) addWall({ ...draft, type: wallType });
      setDraft(null);
    }
    setDragId(null);
  }

  const gridPath = [];
  for (let x = 1; x < W; x += 1) gridPath.push(`M${x},0V${H}`);
  for (let y = 1; y < H; y += 1) gridPath.push(`M0,${y}H${W}`);

  return (
    <div className="relative w-full overflow-hidden rounded-md border border-line bg-surface">
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0"
        style={{
          width: `${((heat.cols * heat.cell) / W) * 100}%`,
          height: `${((heat.rows * heat.cell) / H) * 100}%`,
          imageRendering: "pixelated",
        }}
      />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="relative block w-full select-none"
        style={{ touchAction: tool === "select" ? "pan-y" : "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="img"
        aria-label="Denah ruangan dan peta sinyal"
      >
        <path d={gridPath.join("")} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.6" fill="none" />

        {walls.map((wall) => {
          const style = WALL_STYLE[wall.type] ?? WALL_STYLE.wallBrick;
          return (
            <g key={wall.id}>
              <line
                x1={wall.x1}
                y1={wall.y1}
                x2={wall.x2}
                y2={wall.y2}
                stroke="var(--ink)"
                strokeWidth={style.w}
                strokeDasharray={style.dash}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {tool === "erase" && (
                <line
                  x1={wall.x1}
                  y1={wall.y1}
                  x2={wall.x2}
                  y2={wall.y2}
                  stroke="transparent"
                  strokeWidth="16"
                  vectorEffect="non-scaling-stroke"
                  style={{ cursor: "pointer" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    removeWall(wall.id);
                  }}
                />
              )}
            </g>
          );
        })}

        {draft && (
          <g>
            <line
              x1={draft.x1}
              y1={draft.y1}
              x2={draft.x2}
              y2={draft.y2}
              stroke="var(--accent)"
              strokeWidth="2"
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={(draft.x1 + draft.x2) / 2}
              y={(draft.y1 + draft.y2) / 2 - 0.3}
              textAnchor="middle"
              fontSize="0.55"
              fill="var(--ink)"
              className="num"
            >
              {Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1).toFixed(1)} m
            </text>
          </g>
        )}

        {aps.map((ap, i) => (
          <g key={ap.id}>
            <circle cx={ap.x} cy={ap.y} r="0.32" fill="var(--ink)" stroke="var(--surface)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <text x={ap.x} y={ap.y - 0.55} textAnchor="middle" fontSize="0.5" fill="var(--ink)" className="num">
              AP{i + 1}
            </text>
            <circle
              cx={ap.x}
              cy={ap.y}
              r="0.75"
              fill="transparent"
              style={{ touchAction: "none", cursor: tool === "select" ? "grab" : tool === "erase" ? "pointer" : "default" }}
              onPointerDown={(e) => {
                if (tool === "select") {
                  e.stopPropagation();
                  svgRef.current.setPointerCapture(e.pointerId);
                  setDragId(ap.id);
                } else if (tool === "erase") {
                  e.stopPropagation();
                  removeAp(ap.id);
                }
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
