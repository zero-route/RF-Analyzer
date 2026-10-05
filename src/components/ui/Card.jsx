import InfoTip from "./InfoTip";

export default function Card({ title, tip, action, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-4 pt-4">
          {title && (
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-muted">{title}</h2>
              {tip && <InfoTip term={tip} />}
            </div>
          )}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
