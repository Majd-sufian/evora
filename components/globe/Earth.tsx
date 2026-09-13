"use client";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

type EarthProps = {
  onPointerOver?: () => void;
  onPointerOut?: () => void;
};

export default function Earth({ onPointerOver, onPointerOut }: EarthProps) {
  const texture = useLoader(THREE.TextureLoader, "/textures/earth_lights_2048.png");

  return (
    <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
