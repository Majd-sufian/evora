"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";
import { useEvoraStore } from "@/lib/store";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { clusterIntoRegions } from "@/lib/clustering";
import { getGlowTexture, getRingIconTexture } from "@/lib/three/glowTexture";
import RegionStationList from "./RegionStationList";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.018;
const MIN_SIZE = 0.018;
// A region can hold hundreds of stations (no per-cluster cap, unlike the
// old city-level clustering), and Country View's camera sits much closer
// to the surface than World View's — so both the count and spread
// contributions, plus a hard cap, are tuned well below the old per-city
// constants to keep icons legible instead of ballooning to dominate the
// screen (verified live: the untuned formula rendered a single ~200px
// icon for Belgium).
const SIZE_SCALE_FACTOR = 0.0025;
const SPREAD_SCALE_FACTOR = 0.008;
const MAX_SIZE = 0.055;
const CLUSTER_COLOR = "#00D4FF";
const FAST_CHARGER_MIN_KW = 50;

function clusterSize(count: number, spreadDegrees: number) {
  return Math.min(MIN_SIZE + Math.sqrt(count) * SIZE_SCALE_FACTOR + spreadDegrees * SPREAD_SCALE_FACTOR, MAX_SIZE);
}

/**
 * Region-scale clusters (roughly state/province granularity) shown at
 * Country View instead of a dense per-city grid — real administrative
 * regions are large enough to stay visually separated on the globe, unlike
 * city-level clusters whose real-world separation can be smaller than the
 * marker's own footprint no matter how far the camera zooms in (both scale
 * together under perspective projection). Clicking a region opens a
 * floating scrollable list of its stations (RegionStationList) instead of
 * drilling further into the globe.
 */
export default function RegionClusters() {
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const selectedCountry = useEvoraStore((s) => s.selectedCountry);
  const selectedRegionCluster = useEvoraStore((s) => s.selectedRegionCluster);
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const fastChargersOnly = useEvoraStore((s) => s.layers.fastChargersOnly);
  const setSelectedRegionCluster = useEvoraStore((s) => s.setSelectedRegionCluster);
  const glowTexture = useMemo(() => getGlowTexture(), []);
  const ringIconTexture = useMemo(() => getRingIconTexture(), []);

  const source = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;

  const countryStations = useMemo(() => {
    if (!selectedCountry) return [];
    return source.filter((s) => s.countryCode === selectedCountry).filter((s) => !fastChargersOnly || (s.powerKw ?? 0) >= FAST_CHARGER_MIN_KW);
  }, [source, selectedCountry, fastChargersOnly]);

  const clusters = useMemo(() => {
    const regions = clusterIntoRegions(countryStations).sort((a, b) => b.count - a.count);
    let unlabeledCount = 0;
    return regions.map((cluster) => ({
      ...cluster,
      label: cluster.label ?? `Region ${++unlabeledCount}`,
      position: latLonToVector3(cluster.lat, cluster.lon, GLOBE_RADIUS * SURFACE_OFFSET),
      size: clusterSize(cluster.count, cluster.spreadDegrees),
    }));
  }, [countryStations]);

  if (viewLevel !== "country") return null;

  return (
    <group>
      {clusters.map((cluster) => (
        <group
          key={cluster.id}
          position={cluster.position}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedRegionCluster(selectedRegionCluster?.id === cluster.id ? null : cluster);
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
          {selectedRegionCluster?.id === cluster.id && (
            <RegionStationList cluster={cluster} label={cluster.label} stations={countryStations} />
          )}
        </group>
      ))}
    </group>
  );
}
