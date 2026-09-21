"use client";

import MapLibreGlobe from "@/components/maplibre/MapLibreGlobe";

/**
 * Temporary isolated preview route for the MapLibre migration (see
 * specs/PROJECT_STATUS.md, "Map Detail / Street-Level Zoom"). Not linked
 * from anywhere in the app — visit directly at /maplibre-preview. Will be
 * removed once the real globe is wired into app/page.tsx.
 */
export default function MapLibrePreviewPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-bg-primary">
      <MapLibreGlobe />
    </main>
  );
}
