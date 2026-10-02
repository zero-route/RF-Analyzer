import { useEffect } from "react";
import { useCalcStore } from "@/store/useCalcStore";
import { fromSearchParams } from "@/lib/utils/shareState";

export function useUrlState() {
  const update = useCalcStore((s) => s.update);

  useEffect(() => {
    const patch = fromSearchParams(window.location.search);
    if (Object.keys(patch).length > 0) update(patch);
  }, [update]);
}
