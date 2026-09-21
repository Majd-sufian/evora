"use client";

import { useEffect, useRef } from "react";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { loadDuotoneStyle } from "@/lib/maplibre/duotoneStyle";

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
const INITIAL_ZOOM = 3.2;

type MapLibreGlobeProps = {
  onReady?: () => void;
};

/**
 * Phase 1 of the MapLibre migration (see specs/PROJECT_STATUS.md): a real
 * OSM vector-tile globe, recolored to Evora's palette, replacing the
 * previous hand-rolled Three.js sphere+shader. Not yet wired to the app's
 * view-level/camera state, station markers, or clustering — this is the
 * base map layer only.
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
          attributionControl: { compact: true },
          dragRotate: true,
          touchPitch: false,
        });
        mapRef.current = map;
        map.once("load", () => onReady?.());
        map.on("error", (e) => console.error("MapLibre error event", e.error));
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
