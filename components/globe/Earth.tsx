"use client";

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const ROTATION_DEG_PER_FRAME = 0.05;
const DEG_PER_SECOND = ROTATION_DEG_PER_FRAME * 60;

type EarthProps = {
  paused: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
};

export default function Earth({ paused, onPointerOver, onPointerOut }: EarthProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/textures/earth_lights_2048.png");

  useFrame((_, delta) => {
    if (paused || !meshRef.current) return;
    meshRef.current.rotation.y += THREE.MathUtils.degToRad(DEG_PER_SECOND) * delta;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
