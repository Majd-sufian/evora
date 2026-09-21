"use client";

import { useEffect, useRef } from "react";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { loadDuotoneStyle } from "@/lib/maplibre/duotoneStyle";
import { drawStationIcon } from "@/lib/stationIconCanvas";
import type { ChargingStation, StationStatus } from "@/lib/types";

// MapLibre resolves its tile-processing worker script relative to its own
// module's `import.meta.url` by default, which webpack/Next.js's bundling
// doesn't preserve correctly (the worker request 404s, and the browser
// rejects the resulting HTML fallback as an invalid JS module — silently
// leaving every vector tile unparsed, so only the flat background paints).
// public/maplibre-gl-worker.mjs (+ its own relative import,
// public/maplibre-gl-shared.mjs — the worker fails to load without it too,
// with an unhelpfully blank error event either way) are copies of the
// matching files in node_modules/maplibre-gl/dist/, served as normal static
// assets at a stable URL instead. Re-copy both if maplibre-gl is upgraded
// (see package.json's "postinstall" script).
if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

// Centered over Europe, matching the existing Three.js globe's default framing.
const INITIAL_CENTER: [number, number] = [15, 50];
const INITIAL_ZOOM = 3.8;

// Evora only covers these 20 European countries (lib/data/countries.ts) —
// there's no data, and so no reason to let the map pan/zoom away to
// anywhere else on Earth. maxBounds alone only restricts panning, not what
// a low-zoom globe view already has in frame, so this also sets a minZoom
// floor — combined with the label filter in duotoneStyle.ts, the rest of
// the world is never in view or labeled.
const EUROPE_BOUNDS: [[number, number], [number, number]] = [
  [-11, 35],
  [29, 71],
];
const MIN_ZOOM = 3.6;

const STATUS_COLOR: Record<StationStatus, string> = {
  available: "#00ff88",
  "in-use": "#00d4ff",
  unavailable: "#ff3355",
};

type MapLibreGlobeProps = {
  onReady?: () => void;
};

/**
 * Phase 1 of the MapLibre migration (see specs/PROJECT_STATUS.md): a real
 * OSM vector-tile globe, recolored to Evora's palette, replacing the
 * previous hand-rolled Three.js sphere+shader. Station icons here are a
 * first look at real data on the map (plain symbol layer, `icon-allow-
 * overlap`) — not yet the real clustering/interaction system.
 */
export default function MapLibreGlobe({ onReady }: MapLibreGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    loadDuotoneStyle()
      .then((style) => {
        if (cancelled || !containerRef.current) return;
        const map = new MapLibreMap({
          container: containerRef.current,
          style,
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM,
          minZoom: MIN_ZOOM,
          maxBounds: EUROPE_BOUNDS,
          attributionControl: { compact: true },
          dragRotate: true,
          touchPitch: false,
        });
        mapRef.current = map;
        map.on("error", (e) => console.error("MapLibre error event", e.error));

        map.once("load", async () => {
          (Object.entries(STATUS_COLOR) as [StationStatus, string][]).forEach(([status, color]) => {
            const canvas = drawStationIcon(color);
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            map.addImage(`station-${status}`, imageData, { pixelRatio: 2 });
          });

          try {
            const res = await fetch("/api/stations");
            const data = (await res.json()) as { stations: ChargingStation[] };
            map.addSource("stations", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: data.stations.map((s) => ({
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [s.lon, s.lat] },
                  properties: { status: s.status },
                })),
              },
            });
            map.addLayer({
              id: "station-icons",
              type: "symbol",
              source: "stations",
              layout: {
                "icon-image": ["concat", "station-", ["get", "status"]],
                // Small at the current low zoom (thousands of stations are
                // still visible at once here — real clustering is a later
                // phase) growing as the user zooms in closer.
                "icon-size": ["interpolate", ["linear"], ["zoom"], 3.6, 0.07, 6, 0.16, 9, 0.32],
                "icon-allow-overlap": true,
              },
            });
          } catch (error) {
            console.error("Failed to load station icons", error);
          }

          onReady?.();
        });
      })
      .catch((error) => {
        console.error("Failed to load MapLibre duotone style", error);
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // maplibre-gl.css sets `.maplibregl-map { position: relative }` on this
  // container (its own class, added by the Map constructor) — which, being
  // same-specificity as Tailwind's `.absolute`, can win the cascade
  // depending on stylesheet load order and collapse this div to 0 height.
  // An inline style always wins regardless of load order.
  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
