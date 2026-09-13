"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Earth from "./Earth";
import CountryClusters from "./CountryClusters";
import StationMarkers from "./StationMarkers";

const ROTATION_DEG_PER_FRAME = 0.05;
const DEG_PER_SECOND = ROTATION_DEG_PER_FRAME * 60;
// Faces the globe toward central Europe by default instead of the texture's raw seam.
const INITIAL_ROTATION_DEG = -100;

export default function RotatingGlobe({ externallyPaused }: { externallyPaused: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovering, setHovering] = useState(false);
  const paused = hovering || externallyPaused;

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(INITIAL_ROTATION_DEG);
    }
  }, []);

  useFrame((_, delta) => {
    if (paused || !groupRef.current) return;
    groupRef.current.rotation.y += THREE.MathUtils.degToRad(DEG_PER_SECOND) * delta;
  });

  return (
    <group ref={groupRef}>
      <Earth onPointerOver={() => setHovering(true)} onPointerOut={() => setHovering(false)} />
      <CountryClusters />
      <StationMarkers />
    </group>
  );
}
