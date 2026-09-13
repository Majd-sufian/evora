"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { StationStatus } from "@/lib/types";
import { useEvoraStore } from "@/lib/store";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.02;
const MARKER_RADIUS = 0.007;
const FAST_CHARGER_MIN_KW = 50;

const STATUS_COLOR: Record<StationStatus, string> = {
  available: "#00FF88",
  "in-use": "#00D4FF",
  unavailable: "#FF3355",
};

export default function StationMarkers() {
  const chargersVisible = useEvoraStore((s) => s.layers.chargers);
  const fastChargersOnly = useEvoraStore((s) => s.layers.fastChargersOnly);
  const activityPulses = useEvoraStore((s) => s.layers.activityPulses);
  const groupRef = useRef<THREE.Group>(null);

  const markers = useMemo(
    () =>
      MOCK_STATIONS.filter((s) => !fastChargersOnly || (s.powerKw ?? 0) >= FAST_CHARGER_MIN_KW).map(
        (station) => ({
          ...station,
          position: latLonToVector3(station.lat, station.lon, GLOBE_RADIUS * SURFACE_OFFSET),
        })
      ),
    [fastChargersOnly]
  );

  useFrame(({ clock }) => {
    if (!activityPulses || !groupRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.25;
    groupRef.current.children.forEach((child) => child.scale.setScalar(pulse));
  });

  if (!chargersVisible) return null;

  return (
    <group ref={groupRef}>
      {markers.map((marker) => (
        <mesh key={marker.id} position={marker.position}>
          <sphereGeometry args={[MARKER_RADIUS, 8, 8]} />
          <meshBasicMaterial
            color={STATUS_COLOR[marker.status]}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
