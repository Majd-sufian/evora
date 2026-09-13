"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { StationStatus } from "@/lib/types";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.02;
const MARKER_RADIUS = 0.007;

const STATUS_COLOR: Record<StationStatus, string> = {
  available: "#00FF88",
  "in-use": "#00D4FF",
  unavailable: "#FF3355",
};

export default function StationMarkers() {
  const markers = useMemo(
    () =>
      MOCK_STATIONS.map((station) => ({
        ...station,
        position: latLonToVector3(station.lat, station.lon, GLOBE_RADIUS * SURFACE_OFFSET),
      })),
    []
  );

  return (
    <group>
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
