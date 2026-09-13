"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";
import { COUNTRIES } from "@/lib/data/countries";
import { useEvoraStore } from "@/lib/store";
import { carbonIntensityColor } from "@/lib/colorScale";
import { getGlowTexture, getRingIconTexture } from "@/lib/three/glowTexture";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.015;
const MIN_GLOW_SIZE = 0.05;
const GLOW_SCALE_FACTOR = 0.0022;
const DEFAULT_CLUSTER_COLOR = "#00D4FF";

function glowSize(stationCount: number) {
  return MIN_GLOW_SIZE + Math.sqrt(stationCount) * GLOW_SCALE_FACTOR;
}

export default function CountryClusters() {
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const carbonLayerOn = useEvoraStore((s) => s.layers.carbonIntensity);
  const carbonStatus = useEvoraStore((s) => s.carbonStatus);
  const carbonIntensityByCountry = useEvoraStore((s) => s.carbonIntensityByCountry);
  const glowTexture = useMemo(() => getGlowTexture(), []);
  const ringIconTexture = useMemo(() => getRingIconTexture(), []);

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
        const carbonValue =
          carbonLayerOn && carbonStatus === "ready" ? carbonIntensityByCountry[country.code] : undefined;

        return {
          ...country,
          position: latLonToVector3(country.lat, country.lon, GLOBE_RADIUS * SURFACE_OFFSET),
          size: glowSize(count),
          color: carbonValue !== undefined ? carbonIntensityColor(carbonValue) : DEFAULT_CLUSTER_COLOR,
        };
      }),
    [realCounts, carbonLayerOn, carbonStatus, carbonIntensityByCountry]
  );

  return (
    <group>
      {clusters.map((cluster) => (
        <group key={cluster.code} position={cluster.position}>
          {/* Soft aura behind the badge. */}
          <sprite scale={[cluster.size, cluster.size, 1]}>
            <spriteMaterial
              map={glowTexture}
              color={cluster.color}
              transparent
              opacity={0.55}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
          {/* Crisp energy-node ring badge on top. */}
          <sprite scale={[cluster.size * 0.55, cluster.size * 0.55, 1]}>
            <spriteMaterial
              map={ringIconTexture}
              color={cluster.color}
              transparent
              opacity={1}
              depthWrite={false}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}
