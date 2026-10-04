"use client";

import { useEffect, useRef, useState } from "react";
import { useFloorplanStore } from "@/store/useFloorplanStore";
import { LEVEL_COLORS, clientLabel } from "@/lib/rf/floorplan";
import { clamp } from "@/lib/utils/clamp";
import { formatRate } from "@/lib/rf/throughput";

const SNAP = 0.5;
const snap = (v) => Math.round(v / SNAP) * SNAP;

const WALL_STYLE = {
  wallDrywall: { w: 1.5, dash: "5 3" },
  wallWood: { w: 2.5, dash: undefined },
  wallGlass: { w: 1.5, dash: "2 3" },
  wallBrick: { w: 3.5, dash: undefined },
  wallConcrete: { w: 5.5, dash: undefined },
};

export default function FloorplanCanvas({ tool, wallType, clientKind, heat, results, selectedApId, onSelectAp }) {
  const store = useFloorplanStore();
  const { widthM: W, heightM: H, walls, aps, clients } = store;
  const svgRef = useRef(null);
  const canvasRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [drag, setDrag] = useState(null);
  const u = Math.max(W, H) / 40;

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
        ctx.fillStyle = LEVEL_COLORS[level];
        ctx.fillRect(c, r, 1, 1);
      }
    }
  }, [heat]);

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
      store.addAp(x, y);
    } else if (tool === "client") {
      const [x, y] = toPoint(e);
      store.addClient(x, y, clientKind);
    }
  }

  function onMove(e) {
    if (tool === "wall" && draft) {
      const [x, y] = toPoint(e);
      setDraft({ ...draft, x2: x, y2: y });
    } else if (tool === "select" && drag) {
      const [x, y] = toPoint(e);
      if (drag.type === "ap") store.moveAp(drag.id, x, y);
      else store.moveClient(drag.id, x, y);
    }
  }

  function onUp() {
    if (draft) {
      if (Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1) >= SNAP) store.addWall({ ...draft, type: wallType });
      setDraft(null);
    }
    setDrag(null);
  }

  function startDrag(e, type, id) {
    e.stopPropagation();
    svgRef.current.setPointerCapture(e.pointerId);
    setDrag({ type, id });
    if (type === "ap") onSelectAp(id);
  }

  const gridPath = [];
  for (let x = 1; x < W; x += 1) gridPath.push(`M${x},0V${H}`);
  for (let y = 1; y < H; y += 1) gridPath.push(`M0,${y}H${W}`);

  const hitCursor = tool === "select" ? "grab" : tool === "erase" ? "pointer" : "default";

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
        aria-label="Denah ruangan, peta sinyal, dan penerima"
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
                    store.removeWall(wall.id);
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
              y={(draft.y1 + draft.y2) / 2 - u}
              textAnchor="middle"
              fontSize={u * 1.3}
              fill="var(--ink)"
              className="num"
            >
              {Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1).toFixed(1)} m
            </text>
          </g>
        )}

        {clients.map((client, i) => {
          const res = results[i];
          const connected = res?.connected;
          return (
            <g key={client.id}>
              <rect
                x={client.x - u}
                y={client.y - u}
                width={u * 2}
                height={u * 2}
                rx={u * 0.4}
                fill="var(--surface)"
                stroke="var(--ink)"
                strokeWidth="2"
                strokeDasharray={connected ? undefined : "3 2"}
                vectorEffect="non-scaling-stroke"
              />
              <text x={client.x} y={client.y - u * 1.5} textAnchor="middle" fontSize={u * 1.15} fill="var(--ink)" className="num">
                {clientLabel(clients, i)}
              </text>
              <text x={client.x} y={client.y + u * 2.5} textAnchor="middle" fontSize={u * 1.1} fill="var(--muted)" className="num">
                {connected ? formatRate(res.deliveredMbps) : "putus"}
              </text>
              <rect
                x={client.x - u * 2.2}
                y={client.y - u * 2.2}
                width={u * 4.4}
                height={u * 4.4}
                fill="transparent"
                style={{ touchAction: "none", cursor: hitCursor }}
                onPointerDown={(e) => {
                  if (tool === "select") startDrag(e, "client", client.id);
                  else if (tool === "erase") {
                    e.stopPropagation();
                    store.removeClient(client.id);
                  }
                }}
              />
            </g>
          );
        })}

        {aps.map((ap, i) => (
          <g key={ap.id}>
            {ap.id === selectedApId && (
              <circle
                cx={ap.x}
                cy={ap.y}
                r={u * 1.9}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            )}
            <circle cx={ap.x} cy={ap.y} r={u} fill="var(--ink)" stroke="var(--surface)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <text x={ap.x} y={ap.y - u * 2.2} textAnchor="middle" fontSize={u * 1.15} fill="var(--ink)" className="num">
              AP{i + 1}
            </text>
            <circle
              cx={ap.x}
              cy={ap.y}
              r={u * 2.4}
              fill="transparent"
              style={{ touchAction: "none", cursor: hitCursor }}
              onPointerDown={(e) => {
                if (tool === "select") startDrag(e, "ap", ap.id);
                else if (tool === "erase") {
                  e.stopPropagation();
                  store.removeAp(ap.id);
                }
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
