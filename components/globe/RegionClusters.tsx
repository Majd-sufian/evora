"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { latLonToVector3 } from "@/lib/geo";
import { useEvoraStore } from "@/lib/store";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { clusterIntoRegions } from "@/lib/clustering";
import { getGlowTexture, getRingIconTexture } from "@/lib/three/glowTexture";
import RegionStationList from "./RegionStationList";

const GLOBE_RADIUS = 1;
const SURFACE_OFFSET = 1.018;
// On this globe 1 world unit = Earth's radius (~6,371km) — nudging a
// marker off its real lat/lon by even a "small-looking" fraction of a unit
// moves it hundreds of km across real geography (verified live: an earlier
// version of this file spiderfied overlapping regions off their true
// position and visibly relocated Austria's regions over Italy and Spain).
// So regions are never moved — only sized — to resolve overlap. This floor
// is a hard visibility floor, not just a raw-formula base — verified live
// that a lower value (0.006) satisfied the overlap math but shrank tightly
// packed countries (Switzerland, Belgium) down to barely-visible specks;
// this accepts a little residual closeness in the very tightest countries
// rather than icons nobody can see or click. Raised again after live
// testing at 0.022 — Austria/Switzerland's icons were technically
// non-overlapping but still hard to make out at a glance.
const MIN_ICON_SIZE = 0.032;
const SIZE_SCALE_FACTOR = 0.0025;
const SPREAD_SCALE_FACTOR = 0.008;
const MAX_SIZE = 0.055;
const CLUSTER_COLOR = "#00D4FF";
const FAST_CHARGER_MIN_KW = 50;

function rawClusterSize(count: number, spreadDegrees: number) {
  return MIN_ICON_SIZE + Math.sqrt(count) * SIZE_SCALE_FACTOR + spreadDegrees * SPREAD_SCALE_FACTOR;
}

// A region's real geographic position can be closer to a neighboring
// region's than either icon's own footprint at the sizes above — no amount
// of camera zoom fixes this (verified live: a marker's own size and its
// real-world separation from neighbors scale together under perspective
// projection). Since regions can't be moved (see above), the fix is to cap
// each region's icon size to what its OWN nearest neighbor allows — capping
// every region in a country to the country's single tightest pair (tried
// first) was wrong too: verified live it dragged Germany's regions down to
// near-invisible dots just because one small, oddly-placed region ended up
// close to a much bigger one, even though most of the country had plenty
// of room.
const OVERLAP_MARGIN = 1.05;

function nearestNeighborDistance(positions: THREE.Vector3[], index: number): number {
  let min = Infinity;
  for (let j = 0; j < positions.length; j++) {
    if (j === index) continue;
    const d = positions[index].distanceTo(positions[j]);
    if (d < min) min = d;
  }
  return min;
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const source = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;

  const countryStations = useMemo(() => {
    if (!selectedCountry) return [];
    return source.filter((s) => s.countryCode === selectedCountry).filter((s) => !fastChargersOnly || (s.powerKw ?? 0) >= FAST_CHARGER_MIN_KW);
  }, [source, selectedCountry, fastChargersOnly]);

  const clusters = useMemo(() => {
    const regions = clusterIntoRegions(countryStations).sort((a, b) => b.count - a.count);
    let unlabeledCount = 0;
    const withPosition = regions.map((cluster) => ({
      ...cluster,
      label: cluster.label ?? `Region ${++unlabeledCount}`,
      position: latLonToVector3(cluster.lat, cluster.lon, GLOBE_RADIUS * SURFACE_OFFSET),
    }));

    const positions = withPosition.map((c) => c.position);
    return withPosition.map((cluster, i) => {
      const nearestDist = positions.length > 1 ? nearestNeighborDistance(positions, i) : Infinity;
      const sizeCap = nearestDist === Infinity ? MAX_SIZE : Math.max(nearestDist / OVERLAP_MARGIN, MIN_ICON_SIZE);
      return {
        ...cluster,
        size: Math.min(rawClusterSize(cluster.count, cluster.spreadDegrees), MAX_SIZE, sizeCap),
      };
    });
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
            setHoveredId(cluster.id);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
            setHoveredId((current) => (current === cluster.id ? null : current));
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
          {hoveredId === cluster.id && selectedRegionCluster?.id !== cluster.id && (
            <Html style={{ pointerEvents: "none" }} zIndexRange={[40, 0]} occlude={false}>
              <div className="-translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-sm border border-[#00D4FF33] bg-[#0A1520F2] px-2 py-1 font-mono text-[11px] text-text-primary backdrop-blur-sm">
                {cluster.label}
              </div>
            </Html>
          )}
          {selectedRegionCluster?.id === cluster.id && (
            <RegionStationList cluster={cluster} label={cluster.label} stations={countryStations} />
          )}
        </group>
      ))}
    </group>
  );
}
