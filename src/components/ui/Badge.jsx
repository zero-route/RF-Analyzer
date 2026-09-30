const TONES = {
  neutral: "border-transparent bg-sunken text-muted",
  safe: "border-line bg-transparent text-ink",
  permit: "border-line bg-accent-soft text-ink",
  danger: "border-transparent bg-accent text-on-accent",
};

export default function Badge({ tone = "neutral", icon, className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
