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
 * that only affect width/dasharray) are left as-is — only recoloring, never
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

  boundary_state: { "line-color": PALETTE.boundary },
  "boundary_country_z0-4": { "line-color": PALETTE.boundary },
  "boundary_country_z5-": { "line-color": PALETTE.boundary },

  place_other: { "text-color": PALETTE.textSecondary, "text-halo-color": PALETTE.textHalo },
  place_suburb: { "text-color": PALETTE.textSecondary, "text-halo-color": PALETTE.textHalo },
  place_village: { "text-color": PALETTE.textSecondary, "text-halo-color": PALETTE.textHalo },
  place_town: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_city: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_city_large: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_state: { "text-color": PALETTE.textSecondary, "text-halo-color": PALETTE.textHalo },
  place_country_other: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_country_minor: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
  place_country_major: { "text-color": PALETTE.textPrimary, "text-halo-color": PALETTE.textHalo },
};

function recolorLayer(layer: LayerSpecification): LayerSpecification {
  const overrides = LAYER_OVERRIDES[layer.id];
  if (!overrides || !("paint" in layer)) return layer;
  return { ...layer, paint: { ...layer.paint, ...overrides } } as LayerSpecification;
}

/**
 * Fetches OpenFreeMap's "dark" style (a real OSM vector-tile style — same
 * underlying data source as the app's existing Nominatim address search)
 * and recolors every layer to Evora's own palette, so the base map reads as
 * part of the app rather than a generic embedded basemap. Only paint colors
 * are touched — widths, opacities, and zoom-interpolation curves from the
 * source style are left alone.
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
      // The natural-earth raster relief layer can't be recolored via paint
      // properties (it's a photographic texture) and clashes with a flat
      // duotone look — drop it, keeping only the OSM vector layers.
      .filter((layer) => layer.type !== "raster" && (!("source" in layer) || layer.source !== "ne2_shaded"))
      .map(recolorLayer),
  };
}
