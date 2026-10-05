import { LEVEL_COLORS, clientLabel } from "../rf/floorplan";
import { formatRate } from "../rf/throughput";

const WALL_STYLE = {
  wallDrywall: { w: 2, dash: [8, 5] },
  wallWood: { w: 3.5, dash: [] },
  wallGlass: { w: 2, dash: [3, 5] },
  wallBrick: { w: 5, dash: [] },
  wallConcrete: { w: 8, dash: [] },
};

export function exportFloorplanPng({ widthM, heightM, walls, aps, clients, heat, results, legend, info, showInterference }) {
  const css = getComputedStyle(document.documentElement);
  const read = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  const bg = read("--surface", "#ffffff");
  const ink = read("--ink", "#111111");
  const line = read("--line", "#cccccc");
  const muted = read("--muted", "#666666");

  const s = 1200 / widthM;
  const padX = 48;
  const top = 96;
  const planW = widthM * s;
  const planH = heightM * s;
  const u = (Math.max(widthM, heightM) / 40) * s;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(planW + padX * 2);
  canvas.height = Math.round(top + planH + 190);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = ink;
  ctx.font = "600 30px sans-serif";
  ctx.fillText(`Denah ${widthM} × ${heightM} m`, padX, 48);
  ctx.fillStyle = muted;
  ctx.font = "20px sans-serif";
  ctx.fillText(info, padX, 78);

  ctx.save();
  ctx.beginPath();
  ctx.rect(padX, top, planW, planH);
  ctx.clip();

  const size = heat.cell * s;
  for (let r = 0; r < heat.rows; r += 1) {
    for (let c = 0; c < heat.cols; c += 1) {
      const idx = r * heat.cols + c;
      const level = heat.levels[idx];
      if (level >= 0) {
        ctx.fillStyle = LEVEL_COLORS[level];
        ctx.fillRect(padX + c * size, top + r * size, size + 1, size + 1);
      }
      if (showInterference && heat.interference[idx] && (r + c) % 2 === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(padX + c * size, top + r * size, size + 1, size + 1);
      }
    }
  }

  ctx.strokeStyle = line;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  for (let x = 1; x < widthM; x += 1) {
    ctx.beginPath();
    ctx.moveTo(padX + x * s, top);
    ctx.lineTo(padX + x * s, top + planH);
    ctx.stroke();
  }
  for (let y = 1; y < heightM; y += 1) {
    ctx.beginPath();
    ctx.moveTo(padX, top + y * s);
    ctx.lineTo(padX + planW, top + y * s);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, top, planW, planH);

  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  walls.forEach((w) => {
    const style = WALL_STYLE[w.type] ?? WALL_STYLE.wallBrick;
    ctx.lineWidth = style.w;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(padX + w.x1 * s, top + w.y1 * s);
    ctx.lineTo(padX + w.x2 * s, top + w.y2 * s);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  ctx.textAlign = "center";
  ctx.font = `${u * 1.15}px sans-serif`;
  clients.forEach((client, i) => {
    const cx = padX + client.x * s;
    const cy = top + client.y * s;
    const res = results[i];
    ctx.fillStyle = bg;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.setLineDash(res?.connected ? [] : [6, 4]);
    ctx.fillRect(cx - u, cy - u, u * 2, u * 2);
    ctx.strokeRect(cx - u, cy - u, u * 2, u * 2);
    ctx.setLineDash([]);
    ctx.fillStyle = ink;
    ctx.fillText(clientLabel(clients, i), cx, cy - u * 1.4);
    ctx.fillStyle = muted;
    ctx.fillText(res?.connected ? formatRate(res.deliveredMbps) : "putus", cx, cy + u * 2.3);
  });

  aps.forEach((ap, i) => {
    const cx = padX + ap.x * s;
    const cy = top + ap.y * s;
    ctx.fillStyle = ink;
    ctx.strokeStyle = bg;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, u, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillText(`AP${i + 1}`, cx, cy - u * 1.6);
  });

  ctx.textAlign = "left";
  ctx.font = "20px sans-serif";
  const items = legend.map((item) => ({ color: LEVEL_COLORS[item.level], label: item.label }));
  items.push({ color: null, label: "Tanpa sinyal" });
  if (showInterference) items.push({ color: "rgba(0, 0, 0, 0.5)", label: "Interferensi antar-AP" });

  let x = padX;
  let y = top + planH + 44;
  items.forEach((item) => {
    const width = ctx.measureText(item.label).width + 56;
    if (x + width > canvas.width - padX) {
      x = padX;
      y += 36;
    }
    if (item.color) {
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y - 16, 36, 20);
    }
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 16, 36, 20);
    ctx.fillStyle = ink;
    ctx.fillText(item.label, x + 46, y);
    x += width + 24;
  });

  if (heat.stats) {
    ctx.fillStyle = muted;
    ctx.fillText(
      `Area tercakup ${heat.stats.coveragePct.toFixed(0)}% · sinyal kuat ${heat.stats.goodPct.toFixed(0)}%`,
      padX,
      y + 44
    );
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "denah-sinyal.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
