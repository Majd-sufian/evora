"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RotatingGlobe from "./RotatingGlobe";
import Atmosphere from "./Atmosphere";
import OrbitalRings from "./OrbitalRings";

const WORLD_VIEW_DISTANCE = 2.5;
const STATION_VIEW_DISTANCE = 0.8;
// Camera kept at the spec'd 2.5-unit distance, just angled up slightly so
// Europe (mid-northern latitudes) sits centered instead of hugging the rim.
const WORLD_VIEW_POSITION: [number, number, number] = [0, 0.94, 2.32];

export default function Globe() {
  const [interacting, setInteracting] = useState(false);

  return (
    <Canvas camera={{ position: WORLD_VIEW_POSITION, fov: 60 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 3, 5]} intensity={1} />
      <RotatingGlobe externallyPaused={interacting} />
      <Atmosphere radius={1} />
      <OrbitalRings />
      <OrbitControls
        enablePan={false}
        minDistance={STATION_VIEW_DISTANCE}
        maxDistance={WORLD_VIEW_DISTANCE}
        rotateSpeed={0.4}
        onStart={() => setInteracting(true)}
        onEnd={() => setInteracting(false)}
      />
    </Canvas>
  );
}
