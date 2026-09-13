"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Earth from "./Earth";
import Atmosphere from "./Atmosphere";
import OrbitalRings from "./OrbitalRings";

const WORLD_VIEW_DISTANCE = 2.5;
const STATION_VIEW_DISTANCE = 0.8;

export default function Globe() {
  const [hovering, setHovering] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const paused = hovering || interacting;

  return (
    <Canvas camera={{ position: [0, 0, WORLD_VIEW_DISTANCE], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 3, 5]} intensity={1} />
      <Earth
        paused={paused}
        onPointerOver={() => setHovering(true)}
        onPointerOut={() => setHovering(false)}
      />
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
