"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";
import { COUNTRIES } from "@/lib/data/countries";
import { useEvoraStore } from "@/lib/store";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.015;
const MIN_CLUSTER_RADIUS = 0.014;
const CLUSTER_SCALE_FACTOR = 0.0007;

function clusterRadius(stationCount: number) {
  return MIN_CLUSTER_RADIUS + Math.sqrt(stationCount) * CLUSTER_SCALE_FACTOR;
}

export default function CountryClusters() {
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);

  const realCounts = useMemo(() => {
    if (stationsStatus !== "ready") return null;
    const counts = new Map<string, number>();
    for (const station of stations) {
      counts.set(station.countryCode, (counts.get(station.countryCode) ?? 0) + 1);
    }
    return counts;
  }, [stations, stationsStatus]);

  const clusters = useMemo(
    () =>
      COUNTRIES.map((country) => {
        const count = realCounts?.get(country.code) || country.stationCount;
        return {
          ...country,
          position: latLonToVector3(country.lat, country.lon, GLOBE_RADIUS * SURFACE_OFFSET),
          radius: clusterRadius(count),
        };
      }),
    [realCounts]
  );

  return (
    <group>
      {clusters.map((cluster) => (
        <mesh key={cluster.code} position={cluster.position}>
          <sphereGeometry args={[cluster.radius, 16, 16]} />
          <meshBasicMaterial
            color="#00D4FF"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
