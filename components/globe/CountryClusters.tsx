"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { latLonToVector3 } from "@/lib/geo";
import { COUNTRIES } from "@/lib/data/countries";
import { useEvoraStore } from "@/lib/store";
import { carbonIntensityColor, gridPriceColor } from "@/lib/colorScale";
import { getGlowTexture, getRingIconTexture } from "@/lib/three/glowTexture";
import { getCurrentHourPrice } from "@/lib/gridPrice";

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
  const gridPricesLayerOn = useEvoraStore((s) => s.layers.gridPrices);
  const gridPricesStatus = useEvoraStore((s) => s.gridPricesStatus);
  const gridPricesByCountry = useEvoraStore((s) => s.gridPricesByCountry);
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const setSelectedCountry = useEvoraStore((s) => s.setSelectedCountry);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);
  const glowTexture = useMemo(() => getGlowTexture(), []);
  const ringIconTexture = useMemo(() => getRingIconTexture(), []);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

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
        const priceValue =
          gridPricesLayerOn && gridPricesStatus === "ready"
            ? getCurrentHourPrice(gridPricesByCountry[country.code])
            : undefined;

        let color = DEFAULT_CLUSTER_COLOR;
        if (carbonValue !== undefined) color = carbonIntensityColor(carbonValue);
        else if (priceValue !== undefined) color = gridPriceColor(priceValue);

        return {
          ...country,
          position: latLonToVector3(country.lat, country.lon, GLOBE_RADIUS * SURFACE_OFFSET),
          size: glowSize(count),
          color,
        };
      }),
    [
      realCounts,
      carbonLayerOn,
      carbonStatus,
      carbonIntensityByCountry,
      gridPricesLayerOn,
      gridPricesStatus,
      gridPricesByCountry,
    ]
  );

  // Country badges are sized for World View's camera distance; left ungated,
  // the same fixed-size sprites balloon to cover most of the screen once the
  // camera moves in for Country/Station View, burying the real city-cluster
  // and station markers and eating clicks meant for them.
  if (viewLevel !== "world") return null;

  return (
    <group>
      {clusters.map((cluster) => (
        <group
          key={cluster.code}
          position={cluster.position}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedCountry(cluster.code);
            setViewLevel("country");
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
            setHoveredCode(cluster.code);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
            setHoveredCode((current) => (current === cluster.code ? null : current));
          }}
        >
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
          {hoveredCode === cluster.code && (
            <Html style={{ pointerEvents: "none" }} zIndexRange={[40, 0]} occlude={false}>
              <div className="-translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-sm border border-[#00D4FF33] bg-[#0A1520F2] px-2 py-1 font-mono text-[11px] text-text-primary backdrop-blur-sm">
                {cluster.name}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
