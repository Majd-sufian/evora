"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Earth from "./Earth";
import CountryClusters from "./CountryClusters";
import CityClusters from "./CityClusters";
import StationMarkers from "./StationMarkers";
import { useEvoraStore } from "@/lib/store";
import { globeRotationRef } from "@/lib/three/globeRotation";

const ROTATION_DEG_PER_FRAME = 0.05;
const DEG_PER_SECOND = ROTATION_DEG_PER_FRAME * 60;
// Faces the globe toward central Europe by default instead of the texture's raw seam.
const INITIAL_ROTATION_DEG = -100;

export default function RotatingGlobe({ externallyPaused }: { externallyPaused: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovering, setHovering] = useState(false);
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const paused = hovering || externallyPaused || viewLevel !== "world";

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(INITIAL_ROTATION_DEG);
      globeRotationRef.current = groupRef.current.rotation.y;
    }
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!paused) {
      groupRef.current.rotation.y += THREE.MathUtils.degToRad(DEG_PER_SECOND) * delta;
    }
    globeRotationRef.current = groupRef.current.rotation.y;
  });

  return (
    <group ref={groupRef}>
      <Earth onPointerOver={() => setHovering(true)} onPointerOut={() => setHovering(false)} />
      <CountryClusters />
      <CityClusters />
      <StationMarkers />
    </group>
  );
}
