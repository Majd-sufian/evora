"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import RotatingGlobe from "./RotatingGlobe";
import Atmosphere from "./Atmosphere";
import CameraRig from "./CameraRig";
import { STATION_VIEW_DISTANCE, WORLD_VIEW_DISTANCE, WORLD_VIEW_POSITION } from "@/lib/three/viewConstants";

export default function Globe() {
  const [interacting, setInteracting] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas camera={{ position: WORLD_VIEW_POSITION, fov: 60 }}>
      <ambientLight intensity={0.9} />
      <pointLight position={[5, 3, 5]} intensity={1.4} />
      <RotatingGlobe externallyPaused={interacting} />
      <Atmosphere radius={1} />
      <CameraRig controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
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
