"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import LobeMesh from "./LobeMesh";
import { useCalcStore } from "@/store/useCalcStore";
import { useIsDark } from "@/hooks/useIsDark";
import { beamwidths } from "@/lib/rf/pattern";

export default function PatternScene() {
  const antennaType = useCalcStore((s) => s.antennaType);
  const gainDbi = useCalcStore((s) => s.gainDbi);
  const sectorH = useCalcStore((s) => s.sectorH);
  const dark = useIsDark();
  const bw = useMemo(
    () => beamwidths({ type: antennaType, gainDbi, sectorH }),
    [antennaType, gainDbi, sectorH]
  );
  const lineColor = dark ? "#2a2a2a" : "#d4d4d4";
  const dotColor = dark ? "#ededed" : "#111111";

  return (
    <Canvas frameloop="demand" camera={{ position: [3.4, 2.2, 3.4], fov: 42 }} dpr={[1, 2]}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} />
      <LobeMesh bw={bw} dark={dark} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.78, 1.8, 96]} />
        <meshBasicMaterial color={lineColor} side={2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={dotColor} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={2.2} maxDistance={8} />
    </Canvas>
  );
}
