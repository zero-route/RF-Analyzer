import Tooltip from "./Tooltip";
import { GLOSSARY } from "@/lib/data/glossary";

export default function InfoTip({ term }) {
  const entry = GLOSSARY[term];
  if (!entry) return null;
  return (
    <Tooltip
      label={`Penjelasan ${entry.title}`}
      text={
        <>
          <strong className="font-medium text-ink">{entry.title}</strong>
          <span className="mt-1 block">{entry.body}</span>
        </>
      }
    />
  );
}
