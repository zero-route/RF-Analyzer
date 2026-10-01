"use client";

import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import { HEAT_GRADIENT } from "@/lib/utils/colorRamp";

const PatternScene = dynamic(() => import("./PatternScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-sunken" />,
});

export default function Pattern3D() {
  return (
    <Card title="Pola radiasi 3D">
      <div className="mx-auto aspect-square w-full max-w-[32rem] overflow-hidden rounded-md bg-sunken">
        <PatternScene />
      </div>
      <div className="mx-auto mt-4 w-full max-w-[32rem]">
        <p className="mb-2 text-xs text-muted">Gain relatif terhadap puncak (dB)</p>
        <div className="h-2 rounded-sm" style={{ background: HEAT_GRADIENT }} />
        <div className="num mt-1.5 flex justify-between text-xs text-faint">
          <span>−20</span>
          <span>−15</span>
          <span>−10</span>
          <span>−5</span>
          <span>0</span>
        </div>
        <p className="mt-3 text-xs text-faint">Geser untuk memutar, cubit atau gulir untuk zoom.</p>
      </div>
    </Card>
  );
}
