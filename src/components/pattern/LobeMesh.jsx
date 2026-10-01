"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { directionalGain } from "@/lib/rf/pattern";
import { rampRgb } from "@/lib/utils/colorRamp";

const AZ_STEPS = 72;
const EL_STEPS = 36;
const SCALE = 1.6;

function buildGeometry(bw, dark) {
  const positions = [];
  const colors = [];
  const indices = [];

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
      const [cr, cg, cb] = rampRgb(r, dark);
      colors.push(cr / 255, cg / 255, cb / 255);
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

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export default function LobeMesh({ bw, dark }) {
  const geometry = useMemo(() => buildGeometry(bw, dark), [bw, dark]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.85} metalness={0} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          wireframe
          transparent
          opacity={0.18}
          color={dark ? "#e6eae0" : "#182016"}
        />
      </mesh>
    </group>
  );
}
