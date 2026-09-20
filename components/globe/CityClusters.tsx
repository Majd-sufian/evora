"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";
import { useEvoraStore } from "@/lib/store";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { clusterStations } from "@/lib/clustering";
import { getGlowTexture, getRingIconTexture } from "@/lib/three/glowTexture";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.018;
const MIN_SIZE = 0.02;
const SIZE_SCALE_FACTOR = 0.006;
const CLUSTER_COLOR = "#00D4FF";
const FAST_CHARGER_MIN_KW = 50;

function clusterSize(count: number) {
  return MIN_SIZE + Math.sqrt(count) * SIZE_SCALE_FACTOR;
}

/**
 * City-scale clusters shown at Country View instead of a flat dump of every
 * individual station, so a dense country doesn't read as an overlapping mess
 * of badges. Clicking a cluster drills into Station View scoped to just its
 * members.
 */
export default function CityClusters() {
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const selectedCountry = useEvoraStore((s) => s.selectedCountry);
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const fastChargersOnly = useEvoraStore((s) => s.layers.fastChargersOnly);
  const setSelectedCityCluster = useEvoraStore((s) => s.setSelectedCityCluster);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);
  const glowTexture = useMemo(() => getGlowTexture(), []);
  const ringIconTexture = useMemo(() => getRingIconTexture(), []);

  const source = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;

  const clusters = useMemo(() => {
    if (!selectedCountry) return [];
    const countryStations = source
      .filter((s) => s.countryCode === selectedCountry)
      .filter((s) => !fastChargersOnly || (s.powerKw ?? 0) >= FAST_CHARGER_MIN_KW);
    return clusterStations(countryStations).map((cluster) => ({
      ...cluster,
      position: latLonToVector3(cluster.lat, cluster.lon, GLOBE_RADIUS * SURFACE_OFFSET),
      size: clusterSize(cluster.count),
    }));
  }, [source, selectedCountry, fastChargersOnly]);

  if (viewLevel !== "country") return null;

  return (
    <group>
      {clusters.map((cluster) => (
        <group
          key={cluster.id}
          position={cluster.position}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedCityCluster(cluster);
            setViewLevel("station");
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <sprite scale={[cluster.size, cluster.size, 1]}>
            <spriteMaterial
              map={glowTexture}
              color={CLUSTER_COLOR}
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
          <sprite scale={[cluster.size * 0.6, cluster.size * 0.6, 1]}>
            <spriteMaterial
              map={ringIconTexture}
              color={CLUSTER_COLOR}
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
