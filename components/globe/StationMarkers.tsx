"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { StationStatus } from "@/lib/types";
import { useEvoraStore } from "@/lib/store";
import { getRingIconTexture } from "@/lib/three/glowTexture";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.02;
const MARKER_SIZE = 0.028;
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
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const setSelectedStation = useEvoraStore((s) => s.setSelectedStation);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);
  const setStationPanelOpen = useEvoraStore((s) => s.setStationPanelOpen);
  const groupRef = useRef<THREE.Group>(null);
  const ringIconTexture = useMemo(() => getRingIconTexture(), []);

  const sourceStations = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;

  const markers = useMemo(
    () =>
      sourceStations
        .filter((s) => !fastChargersOnly || (s.powerKw ?? 0) >= FAST_CHARGER_MIN_KW)
        .map((station) => ({
          ...station,
          position: latLonToVector3(station.lat, station.lon, GLOBE_RADIUS * SURFACE_OFFSET),
        })),
    [sourceStations, fastChargersOnly]
  );

  useFrame(({ clock }) => {
    if (!activityPulses || !groupRef.current) return;
    const pulse = MARKER_SIZE * (1 + Math.sin(clock.elapsedTime * 2) * 0.25);
    groupRef.current.children.forEach((child) => child.scale.set(pulse, pulse, 1));
  });

  if (!chargersVisible) return null;

  return (
    <group ref={groupRef}>
      {markers.map((marker) => (
        <sprite
          key={marker.id}
          position={marker.position}
          scale={[MARKER_SIZE, MARKER_SIZE, 1]}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedStation(marker);
            setViewLevel("station");
            setStationPanelOpen(true);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <spriteMaterial
            map={ringIconTexture}
            color={STATUS_COLOR[marker.status]}
            transparent
            opacity={0.95}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}
