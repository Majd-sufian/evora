"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLonToVector3, spiderfyPositions } from "@/lib/geo";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { StationStatus } from "@/lib/types";
import { useEvoraStore } from "@/lib/store";
import { getRingIconTexture } from "@/lib/three/glowTexture";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.02;
const MARKER_SIZE = 0.028;
const FAST_CHARGER_MIN_KW = 50;
// Station View's camera never gets close enough to the surface (it's capped
// well outside the atmosphere glow shell) for real lat/lon differences of a
// few hundred meters to a few km to read as visually distinct — at that
// distance a handful of stations in the same town all project to
// essentially one screen point. So several stations near a geocoded search
// result are arranged on a ring around the group's true centroid instead of
// at their own real positions — an intentionally inaccurate but
// always-legible layout. (Region drill-down no longer goes through this —
// picking a station from a region's list, see RegionStationList, jumps
// straight to that one real station.)
const CLUSTER_RING_RADIUS = MARKER_SIZE * 1;

const STATUS_COLOR: Record<StationStatus, string> = {
  available: "#00FF88",
  "in-use": "#00D4FF",
  unavailable: "#FF3355",
};

// Pulse ring cycle durations per status; unavailable stations don't pulse.
const PULSE_PERIOD_SECONDS: Partial<Record<StationStatus, number>> = {
  available: 2,
  "in-use": 1,
};

export default function StationMarkers() {
  const chargersVisible = useEvoraStore((s) => s.layers.chargers);
  const fastChargersOnly = useEvoraStore((s) => s.layers.fastChargersOnly);
  const activityPulses = useEvoraStore((s) => s.layers.activityPulses);
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const selectedStation = useEvoraStore((s) => s.selectedStation);
  const flyToTarget = useEvoraStore((s) => s.flyToTarget);
  const setSelectedStation = useEvoraStore((s) => s.setSelectedStation);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);
  const setStationPanelOpen = useEvoraStore((s) => s.setStationPanelOpen);
  const groupRef = useRef<THREE.Group>(null);
  const ringIconTexture = useMemo(() => getRingIconTexture(), []);

  const sourceStations = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;

  const markers = useMemo(() => {
    const eligible = sourceStations.filter(
      (s) => !fastChargersOnly || (s.powerKw ?? 0) >= FAST_CHARGER_MIN_KW
    );
    if (viewLevel !== "station") return [];

    function ringAround(center: THREE.Vector3, group: typeof eligible) {
      const positions = spiderfyPositions(center, group.length, CLUSTER_RING_RADIUS);
      return group.map((station, i) => ({ ...station, position: positions[i] }));
    }

    if (selectedStation) {
      const station = eligible.find((s) => s.id === selectedStation.id);
      if (!station) return [];
      return [{ ...station, position: latLonToVector3(station.lat, station.lon, GLOBE_RADIUS * SURFACE_OFFSET) }];
    }

    if (flyToTarget) {
      const RADIUS_DEGREES = 0.5;
      const nearby = eligible.filter(
        (s) =>
          Math.abs(s.lat - flyToTarget.lat) <= RADIUS_DEGREES &&
          Math.abs(s.lon - flyToTarget.lon) <= RADIUS_DEGREES
      );
      const center = latLonToVector3(flyToTarget.lat, flyToTarget.lon, GLOBE_RADIUS * SURFACE_OFFSET);
      return ringAround(center, nearby);
    }

    return [];
  }, [sourceStations, fastChargersOnly, viewLevel, selectedStation, flyToTarget]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      const period = activityPulses ? (child.userData.pulsePeriod as number | undefined) : undefined;
      const scale = period
        ? MARKER_SIZE * (1 + Math.sin((clock.elapsedTime / period) * Math.PI * 2) * 0.25)
        : MARKER_SIZE;
      child.scale.set(scale, scale, 1);
    });
  });

  // Country/city-scale clusters take over the display at World and Country
  // View — individual station markers only ever belong at Station View
  // (previously this only excluded "country", so World View was silently
  // rendering every loaded station as a raw sprite the whole time, just
  // visually buried under the much larger CountryClusters badges).
  if (!chargersVisible || viewLevel !== "station") return null;

  return (
    <group ref={groupRef}>
      {markers.map((marker) => (
        <sprite
          key={marker.id}
          position={marker.position}
          scale={[MARKER_SIZE, MARKER_SIZE, 1]}
          userData={{ pulsePeriod: PULSE_PERIOD_SECONDS[marker.status] }}
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
