"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { directionalGain } from "@/lib/rf/pattern";
import { heatRgb } from "@/lib/utils/colorRamp";
import { clamp } from "@/lib/utils/clamp";

const AZ_STEPS = 72;
const EL_STEPS = 36;
const SCALE = 1.6;
const LINE_AZ_EVERY = 4;
const LINE_EL_EVERY = 2;
const MIN_DB = -20;

function build(bw) {
  const positions = [];
  const colors = [];
  const indices = [];
  const color = new THREE.Color();

  for (let j = 0; j <= EL_STEPS; j += 1) {
    const el = -90 + (180 * j) / EL_STEPS;
    const elRad = (el * Math.PI) / 180;
    for (let i = 0; i <= AZ_STEPS; i += 1) {
      const az = -180 + (360 * i) / AZ_STEPS;
      const azRad = (az * Math.PI) / 180;
      const r = directionalGain(az, el, bw);
      positions.push(
        r * SCALE * Math.cos(elRad) * Math.cos(azRad),
        r * SCALE * Math.sin(elRad),
        r * SCALE * Math.cos(elRad) * Math.sin(azRad)
      );
      const db = 10 * Math.log10(Math.max(r, 1e-6));
      const [cr, cg, cb] = heatRgb(clamp((db - MIN_DB) / -MIN_DB, 0, 1));
      color.setRGB(cr / 255, cg / 255, cb / 255, THREE.SRGBColorSpace);
      colors.push(color.r, color.g, color.b);
    }
  }

  const row = AZ_STEPS + 1;
  for (let j = 0; j < EL_STEPS; j += 1) {
    for (let i = 0; i < AZ_STEPS; i += 1) {
      const a = j * row + i;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const vertex = (j, i) => {
    const k = (j * row + i) * 3;
    return [positions[k], positions[k + 1], positions[k + 2]];
  };

  const linePositions = [];
  for (let j = 0; j <= EL_STEPS; j += LINE_EL_EVERY) {
    for (let i = 0; i < AZ_STEPS; i += 1) {
      linePositions.push(...vertex(j, i), ...vertex(j, i + 1));
    }
  }
  for (let i = 0; i <= AZ_STEPS; i += LINE_AZ_EVERY) {
    for (let j = 0; j < EL_STEPS; j += 1) {
      linePositions.push(...vertex(j, i), ...vertex(j + 1, i));
    }
  }

  const surface = new THREE.BufferGeometry();
  surface.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  surface.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  surface.setIndex(indices);

  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

  return { surface, lines };
}

export default function LobeMesh({ bw }) {
  const geometry = useMemo(() => build(bw), [bw]);

  useEffect(
    () => () => {
      geometry.surface.dispose();
      geometry.lines.dispose();
    },
    [geometry]
  );

  return (
    <group>
      <mesh geometry={geometry.surface}>
        <meshBasicMaterial
          vertexColors
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <lineSegments geometry={geometry.lines}>
        <lineBasicMaterial color="#000000" transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}
