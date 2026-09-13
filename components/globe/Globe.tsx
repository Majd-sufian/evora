"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RotatingGlobe from "./RotatingGlobe";
import Atmosphere from "./Atmosphere";

const WORLD_VIEW_DISTANCE = 2.5;
const STATION_VIEW_DISTANCE = 0.8;
// Camera kept at the spec'd 2.5-unit distance, angled up just enough that
// Europe sits centered without letting Africa dominate the frame below it.
const WORLD_VIEW_POSITION: [number, number, number] = [0, 1.35, 2.09];

export default function Globe() {
  const [interacting, setInteracting] = useState(false);

  return (
    <Canvas camera={{ position: WORLD_VIEW_POSITION, fov: 60 }}>
      <ambientLight intensity={0.9} />
      <pointLight position={[5, 3, 5]} intensity={1.4} />
      <RotatingGlobe externallyPaused={interacting} />
      <Atmosphere radius={1} />
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
