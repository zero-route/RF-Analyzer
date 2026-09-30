export default function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-4 pt-4">
          {title && <h2 className="text-sm font-medium text-muted">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
