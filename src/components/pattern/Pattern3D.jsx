"use client";

import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";

const PatternScene = dynamic(() => import("./PatternScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-md bg-sunken" />,
});

export default function Pattern3D() {
  return (
    <Card title="Pola radiasi 3D">
      <div className="h-80 w-full overflow-hidden rounded-md bg-sunken sm:h-96">
        <PatternScene />
      </div>
      <p className="mt-3 text-xs text-faint">Geser untuk memutar, cubit untuk zoom. Area yang lebih kontras menandakan sinyal lebih kuat.</p>
    </Card>
  );
}
