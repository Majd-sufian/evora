import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

/**
 * Evora's own palette (app/globals.css), reused here so the map blends into
 * the rest of the UI instead of looking like a generic embedded basemap.
 */
const PALETTE = {
  ocean: "#02060a",
  land: "#0a1520",
  landAlt: "#0d1c28",
  building: "#102436",
  buildingOutline: "#173147",
  roadMinor: "#123143",
  roadMajor: "#1c4c66",
  roadMotorway: "#00d4ff",
  rail: "#183a4c",
  boundary: "#00d4ff8c",
  textPrimary: "#e8f4f8",
  textSecondary: "#7ba3b8",
  textHalo: "#050a0f",
} as const;

/** Maps each OpenFreeMap "dark" style layer id to the paint properties to
 * overwrite with Evora's palette. Layers not listed here (icons, casings
 * that only affect width/dasharray) are left as-is ... only recoloring, never
 * touching layout-affecting properties like width/opacity/blur. */
const LAYER_OVERRIDES: Record<string, Record<string, string>> = {
  background: { "background-color": PALETTE.ocean },
  water: { "fill-color": PALETTE.ocean },
  waterway: { "line-color": PALETTE.ocean },
  water_name: { "text-color": PALETTE.textSecondary, "text-halo-color": PALETTE.textHalo },

  landcover_ice_shelf: { "fill-color": PALETTE.land },
  landcover_glacier: { "fill-color": PALETTE.land },
  landuse_residential: { "fill-color": PALETTE.land },
  landcover_wood: { "fill-color": PALETTE.landAlt },
  landuse_park: { "fill-color": PALETTE.landAlt },

  building: { "fill-color": PALETTE.building, "fill-outline-color": PALETTE.buildingOutline },

  "aeroway-taxiway": { "line-color": PALETTE.roadMinor },
  "aeroway-runway-casing": { "line-color": PALETTE.roadMajor },
  "aeroway-area": { "fill-color": PALETTE.land },
  "aeroway-runway": { "line-color": PALETTE.roadMinor },

  road_area_pier: { "fill-color": PALETTE.land },
  road_pier: { "line-color": PALETTE.roadMinor },

  highway_path: { "line-color": PALETTE.roadMinor },
  highway_minor: { "line-color": PALETTE.roadMinor },
  highway_major_casing: { "line-color": PALETTE.land },
  highway_major_inner: { "line-color": PALETTE.roadMajor },
  highway_major_subtle: { "line-color": PALETTE.roadMajor },
  highway_motorway_casing: { "line-color": PALETTE.land },
  highway_motorway_inner: { "line-color": PALETTE.roadMotorway },
  highway_motorway_subtle: { "line-color": PALETTE.roadMotorway },

  railway_transit: { "line-color": PALETTE.rail },
  railway_transit_dashline: { "line-color": PALETTE.ocean },
  railway_minor: { "line-color": PALETTE.rail },
  railway_minor_dashline: { "line-color": PALETTE.ocean },
  railway: { "line-color": PALETTE.rail },
  railway_dashline: { "line-color": PALETTE.ocean },

  highway_name_other: { "text-color": PALETTE.textSecondary, "text-halo-color": PALETTE.textHalo },
  highway_name_motorway: { "text-color": PALETTE.textSecondary, "text-halo-color": PALETTE.textHalo },

  "boundary_country_z0-4": { "line-color": PALETTE.boundary },
  "boundary_country_z5-": { "line-color": PALETTE.boundary },

  place_town: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_city: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_city_large: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_country_minor: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_country_major: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
};

/** Layers dropped entirely ... admin subdivisions and hyper-local place names
 * that read as noise at the country/city granularity Evora actually needs
 * ("we only care about country, city ... not every sub-region and hamlet"). */
const DROPPED_LAYERS = new Set([
  "place_other",
  "place_suburb",
  "place_village",
  "place_state",
  "place_country_other",
  "boundary_state",
]);

/** Layers gated behind a much higher minzoom than OpenFreeMap's own default ...
 * roads, rail, buildings, and piers only matter once genuinely zoomed to
 * street level, which the app doesn't reach yet (its closest "Station View"
 * is still country/city-scale). At the current World/Country zoom range
 * this keeps the globe to just ocean, land, country borders, and
 * country/city labels, instead of a dense mesh of every minor road. */
const HIGH_MINZOOM_LAYERS = new Set([
  "aeroway-taxiway",
  "aeroway-runway-casing",
  "aeroway-area",
  "aeroway-runway",
  "road_area_pier",
  "road_pier",
  "highway_path",
  "highway_minor",
  "highway_major_casing",
  "highway_major_inner",
  "highway_major_subtle",
  "highway_motorway_casing",
  "highway_motorway_inner",
  "highway_motorway_subtle",
  "railway_transit",
  "railway_transit_dashline",
  "railway_minor",
  "railway_minor_dashline",
  "railway",
  "railway_dashline",
  "highway_name_other",
  "highway_name_motorway",
  "building",
  "road_oneway",
  "road_oneway_opposite",
]);
const DETAIL_MINZOOM = 9;

/** Evora only has data for 20 European countries (lib/data/countries.ts) ...
 * `maxBounds` on the map only restricts panning, not what a low-zoom globe
 * view can already see, so place labels for the rest of the world still
 * showed up. Filtering these layers to a rough Europe bounding polygon
 * keeps only the labels that are actually relevant. */
// A rough approximation, not a precise match to the 20 countries in
// lib/data/countries.ts ... an axis-aligned box can't follow Europe's actual
// coastline/political shape, so it still catches some of Turkey/Cyprus/the
// North African coast at the edges. Good enough to cut the obvious noise
// (Middle East, Russia's interior, etc.) for now; a precise per-country
// filter would need the vector tiles' own country-code property, joined
// against COUNTRIES ... a refinement for later, not blocking.
const EUROPE_POLYGON = {
  type: "Polygon" as const,
  coordinates: [
    [
      [-11, 35],
      [29, 35],
      [29, 71],
      [-11, 71],
      [-11, 35],
    ],
  ],
};
const LABEL_LAYERS = new Set([
  "place_town",
  "place_city",
  "place_city_large",
  "place_country_minor",
  "place_country_major",
]);

function recolorLayer(layer: LayerSpecification): LayerSpecification {
  let next = layer;
  const overrides = LAYER_OVERRIDES[layer.id];
  if (overrides && "paint" in layer) {
    next = { ...next, paint: { ...next.paint, ...overrides } } as LayerSpecification;
  }
  if (HIGH_MINZOOM_LAYERS.has(layer.id)) {
    next = { ...next, minzoom: DETAIL_MINZOOM };
  }
  if (LABEL_LAYERS.has(layer.id)) {
    const withinEurope = ["within", EUROPE_POLYGON];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = (next as any).filter;
    next = {
      ...next,
      filter: existing ? ["all", existing, withinEurope] : withinEurope,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
  return next;
}

/**
 * Fetches OpenFreeMap's "dark" style (a real OSM vector-tile style ... same
 * underlying data source as the app's existing Nominatim address search)
 * and recolors every layer to Evora's own palette, so the base map reads as
 * part of the app rather than a generic embedded basemap. Colors, dropped
 * layers, and minzoom gating are the only things touched ... widths,
 * opacities, and zoom-interpolation curves from the source style are left
 * alone on anything that survives.
 */
export async function loadDuotoneStyle(): Promise<StyleSpecification> {
  const res = await fetch("https://tiles.openfreemap.org/styles/dark");
  if (!res.ok) {
    throw new Error(`Failed to load base map style: ${res.status}`);
  }
  const base = (await res.json()) as StyleSpecification;

  return {
    ...base,
    projection: { type: "globe" },
    layers: base.layers
      .filter(
        (layer) =>
          // The natural-earth raster relief layer can't be recolored via
          // paint properties (it's a photographic texture) and clashes with
          // a flat duotone look ... drop it, keeping only the OSM vector layers.
          layer.type !== "raster" &&
          (!("source" in layer) || layer.source !== "ne2_shaded") &&
          !DROPPED_LAYERS.has(layer.id)
      )
      .map(recolorLayer),
  };
}
