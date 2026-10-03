const STYLES = {
  safe: "bg-ok-soft text-ok",
  isolated: "bg-ok-soft text-ok",
  permit: "bg-warn-soft text-warn",
  danger: "bg-bad-soft text-bad",
};

function Icon({ level }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
  };
  if (level === "danger") {
    return (
      <svg {...common}>
        <path d="M8 2 14.5 13.5h-13z" />
        <path d="M8 6.5v3.2M8 11.6v.1" />
      </svg>
    );
  }
  if (level === "permit") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.8V8l2.2 1.4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="6" />
      <path d="m5.4 8.2 1.8 1.8 3.4-3.6" />
    </svg>
  );
}

export default function StatusBadge({ level, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[level] ?? "bg-sunken text-muted"
      }`}
    >
      <Icon level={level} />
      {label}
    </span>
  );
}
