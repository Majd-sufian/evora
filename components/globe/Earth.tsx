"use client";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

type EarthProps = {
  onPointerOver?: () => void;
  onPointerOut?: () => void;
};

// Tints the daytime Earth texture a deep cyan-blue so continents stay legible
// while the whole globe reads as a dark, glowing "digital planet" rather than
// a photoreal daytime render.
const GLOBE_TINT = new THREE.Color("#3A6EC0");

export default function Earth({ onPointerOver, onPointerOut }: EarthProps) {
  const texture = useLoader(THREE.TextureLoader, "/textures/earth_atmos_2048.jpg");

  return (
    <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} color={GLOBE_TINT} />
    </mesh>
  );
}
