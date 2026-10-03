"use client";

const PAD_X = 18;
const TOP = 36;
const BASE = 124;
const HEIGHT = 168;

export default function ChannelChart({ band, channels, freqMHz, onSelect }) {
  const [lo, hi] = band.rangeMHz;
  const px = band.pxPerMHz;
  const width = (hi - lo) * px + PAD_X * 2;
  const x = (mhz) => PAD_X + (mhz - lo) * px;
  const is24 = band.id === "24";
  const sample = channels[0];
  const channelPx = sample ? sample.widthMHz * px : 0;
  const labelEvery = !is24 && channelPx < 22 ? 2 : 1;

  const ticks = [];
  const first = Math.ceil(lo / band.tickStep) * band.tickStep;
  for (let t = first; t <= hi; t += band.tickStep) ticks.push(t);

  const markerVisible = freqMHz >= lo && freqMHz <= hi;

  return (
    <div className="overflow-x-auto rounded-md border border-line bg-sunken">
      <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={`Peta kanal ${band.label}`}>
        {channels.map((channel, i) => {
          const active = Math.abs(channel.centerMHz - freqMHz) < 0.5;
          const left = channel.centerMHz - channel.widthMHz / 2;
          const right = channel.centerMHz + channel.widthMHz / 2;
          const fillOpacity = active ? 0.55 : is24 ? (channel.clear ? 0.3 : 0.1) : 0.18;
          const stroke = active ? "var(--ink)" : "var(--accent)";
          const shape = is24 ? (
            <path
              d={`M${x(left - 1)},${BASE} L${x(left + 2)},${TOP + 26} L${x(right - 2)},${TOP + 26} L${x(right + 1)},${BASE} Z`}
              fill="var(--accent)"
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth={active ? 2 : 1}
            />
          ) : (
            <rect
              x={x(left) + 0.5}
              y={TOP + 14}
              width={Math.max(channel.widthMHz * px - 1, 1)}
              height={BASE - TOP - 14}
              rx="2"
              fill="var(--accent)"
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth={active ? 2 : 1}
              strokeDasharray={channel.dfs ? "3 3" : undefined}
            />
          );
          const showLabel = is24 || i % labelEvery === 0;

          return (
            <g
              key={channel.key}
              onClick={() => onSelect(channel)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`Kanal ${channel.label}, ${channel.centerMHz} MHz`}
            >
              <rect x={x(left)} y={TOP} width={channel.widthMHz * px} height={BASE - TOP} fill="transparent" />
              {shape}
              {showLabel && (
                <text
                  x={x(channel.centerMHz)}
                  y={is24 ? TOP + 18 : (TOP + 14 + BASE) / 2 + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fill={active ? "var(--ink)" : "var(--muted)"}
                  fontWeight={active ? 600 : 400}
                  className="num"
                >
                  {channel.label}
                </text>
              )}
            </g>
          );
        })}

        <line x1={PAD_X} y1={BASE} x2={width - PAD_X} y2={BASE} stroke="var(--line)" strokeWidth="1" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={BASE} x2={x(t)} y2={BASE + 5} stroke="var(--faint)" strokeWidth="1" />
            <text x={x(t)} y={BASE + 19} textAnchor="middle" fontSize="10" fill="var(--faint)" className="num">
              {t}
            </text>
          </g>
        ))}

        {markerVisible && (
          <g>
            <line
              x1={x(freqMHz)}
              y1={20}
              x2={x(freqMHz)}
              y2={BASE}
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text
              x={Math.min(Math.max(x(freqMHz), PAD_X + 30), width - PAD_X - 30)}
              y={14}
              textAnchor="middle"
              fontSize="10"
              fill="var(--ink)"
              className="num"
            >
              {freqMHz} MHz
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
