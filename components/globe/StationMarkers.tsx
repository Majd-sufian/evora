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
// Stations within ~110m of each other (3 decimal degrees) are treated as
// "the same lot" and spread into a small ring so each stays clickable
// instead of stacking exactly on top of one another.
const SPIDERFY_GROUP_PRECISION = 3;
const SPIDERFY_RING_RADIUS = MARKER_SIZE * 2;

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
  const selectedCityCluster = useEvoraStore((s) => s.selectedCityCluster);
  const selectedStation = useEvoraStore((s) => s.selectedStation);
  const flyToTarget = useEvoraStore((s) => s.flyToTarget);
  const setSelectedStation = useEvoraStore((s) => s.setSelectedStation);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);
  const setStationPanelOpen = useEvoraStore((s) => s.setStationPanelOpen);
  const groupRef = useRef<THREE.Group>(null);
  const ringIconTexture = useMemo(() => getRingIconTexture(), []);

  const sourceStations = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;

  const markers = useMemo(() => {
    let filtered = sourceStations.filter(
      (s) => !fastChargersOnly || (s.powerKw ?? 0) >= FAST_CHARGER_MIN_KW
    );

    // At Station View, only show the drilled-into cluster's members, the one
    // directly-selected station, or (for a geocoded fly-to) nearby stations —
    // instead of every marker worldwide, which overlaps into an unreadable mess.
    if (viewLevel === "station") {
      if (selectedCityCluster) {
        const ids = new Set(selectedCityCluster.stationIds);
        filtered = filtered.filter((s) => ids.has(s.id));
      } else if (selectedStation) {
        filtered = filtered.filter((s) => s.id === selectedStation.id);
      } else if (flyToTarget) {
        const RADIUS_DEGREES = 0.5;
        filtered = filtered.filter(
          (s) =>
            Math.abs(s.lat - flyToTarget.lat) <= RADIUS_DEGREES &&
            Math.abs(s.lon - flyToTarget.lon) <= RADIUS_DEGREES
        );
      }
    }

    // Group near-identical coordinates (e.g. several real chargers at one
    // depot/parking lot) so they can be spiderfied apart instead of
    // rendering exactly on top of each other.
    const groups = new Map<string, typeof filtered>();
    for (const station of filtered) {
      const key = `${station.lat.toFixed(SPIDERFY_GROUP_PRECISION)}:${station.lon.toFixed(SPIDERFY_GROUP_PRECISION)}`;
      const bucket = groups.get(key);
      if (bucket) bucket.push(station);
      else groups.set(key, [station]);
    }

    return Array.from(groups.values()).flatMap((group) => {
      const center = latLonToVector3(group[0].lat, group[0].lon, GLOBE_RADIUS * SURFACE_OFFSET);
      const positions = spiderfyPositions(center, group.length, SPIDERFY_RING_RADIUS);
      return group.map((station, i) => ({ ...station, position: positions[i] }));
    });
  }, [sourceStations, fastChargersOnly, viewLevel, selectedCityCluster, selectedStation, flyToTarget]);

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
