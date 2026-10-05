import Card from "@/components/ui/Card";
import { GLOSSARY } from "@/lib/data/glossary";

export default function GlossaryCard() {
  return (
    <Card title="Panduan istilah">
      <ul>
        {Object.entries(GLOSSARY).map(([key, entry]) => (
          <li key={key} className="border-b border-line last:border-b-0">
            <details className="group py-2.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm text-ink">
                {entry.title}
                <span className="text-faint transition-transform group-open:rotate-180" aria-hidden="true">
                  ⌄
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{entry.body}</p>
            </details>
          </li>
        ))}
      </ul>
    </Card>
  );
}
