import { create } from "zustand";
import { ChargingStation, LayerState, ViewLevel } from "./types";
import { StationCluster } from "./clustering";

type DataStatus = "idle" | "loading" | "ready" | "error";

type EvoraStore = {
  viewLevel: ViewLevel;
  selectedCountry: string | null;
  /** The city-scale cluster drilled into from Country View, if any. */
  selectedCityCluster: StationCluster | null;
  selectedStation: ChargingStation | null;
  /** An arbitrary city/address searched via geocoding, not tied to our own data. */
  flyToTarget: { lat: number; lon: number; label: string } | null;
  layers: LayerState;
  stationPanelOpen: boolean;

  stations: ChargingStation[];
  stationsStatus: DataStatus;
  stationsUpdatedAt: number | null;

  carbonIntensityByCountry: Record<string, number>;
  carbonStatus: DataStatus;
  carbonUpdatedAt: number | null;

  /** EUR/MWh hourly day-ahead prices per country, keyed by ISO2 code. */
  gridPricesByCountry: Record<string, number[]>;
  gridPricesStatus: DataStatus;
  gridPricesUpdatedAt: number | null;

  setViewLevel: (viewLevel: ViewLevel) => void;
  setSelectedCountry: (code: string | null) => void;
  setSelectedCityCluster: (cluster: StationCluster | null) => void;
  setSelectedStation: (station: ChargingStation | null) => void;
  flyTo: (target: { lat: number; lon: number; label: string }) => void;
  setStationPanelOpen: (open: boolean) => void;
  toggleLayer: (layer: keyof LayerState) => void;
  loadStations: () => Promise<void>;
  loadCarbonIntensity: () => Promise<void>;
  loadGridPrices: () => Promise<void>;
  /** Steps back one zoom level: station -> country (or world) -> world. */
  goBack: () => void;
};

export const useEvoraStore = create<EvoraStore>((set, get) => ({
  viewLevel: "world",
  selectedCountry: null,
  selectedCityCluster: null,
  selectedStation: null,
  flyToTarget: null,
  layers: {
    chargers: true,
    gridPrices: false,
    carbonIntensity: false,
    activityPulses: true,
    fastChargersOnly: false,
  },
  stationPanelOpen: false,

  stations: [],
  stationsStatus: "idle",
  stationsUpdatedAt: null,

  carbonIntensityByCountry: {},
  carbonStatus: "idle",
  carbonUpdatedAt: null,

  gridPricesByCountry: {},
  gridPricesStatus: "idle",
  gridPricesUpdatedAt: null,

  setViewLevel: (viewLevel) => set({ viewLevel }),
  setSelectedCountry: (code) => set({ selectedCountry: code }),
  setSelectedCityCluster: (cluster) => set({ selectedCityCluster: cluster }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setStationPanelOpen: (open) => set({ stationPanelOpen: open }),
  flyTo: (target) =>
    set({
      flyToTarget: target,
      selectedCountry: null,
      selectedCityCluster: null,
      selectedStation: null,
      stationPanelOpen: false,
      viewLevel: "station",
    }),
  toggleLayer: (layer) => {
    set((state) => {
      const next: LayerState = { ...state.layers, [layer]: !state.layers[layer] };
      // Grid Prices and Carbon Intensity are mutually exclusive overlays.
      if (layer === "gridPrices" && next.gridPrices) next.carbonIntensity = false;
      if (layer === "carbonIntensity" && next.carbonIntensity) next.gridPrices = false;
      return { layers: next };
    });
    if (layer === "carbonIntensity" && get().layers.carbonIntensity) {
      get().loadCarbonIntensity();
    }
  },

  loadStations: async () => {
    if (get().stationsStatus === "loading" || get().stationsStatus === "ready") return;
    set({ stationsStatus: "loading" });
    try {
      const res = await fetch("/api/stations");
      const data = (await res.json()) as { stations: ChargingStation[] };
      set({ stations: data.stations ?? [], stationsStatus: "ready", stationsUpdatedAt: Date.now() });
    } catch (error) {
      console.error("Failed to load stations", error);
      set({ stationsStatus: "error" });
    }
  },

  goBack: () => {
    const { viewLevel, selectedCountry, selectedCityCluster, selectedStation } = get();
    if (viewLevel === "station") {
      if (selectedStation && selectedCityCluster) {
        // Step back from a single station to the cluster's member list.
        set({ selectedStation: null, stationPanelOpen: false });
      } else {
        set({
          selectedStation: null,
          selectedCityCluster: null,
          flyToTarget: null,
          stationPanelOpen: false,
          viewLevel: selectedCountry ? "country" : "world",
        });
      }
    } else if (viewLevel === "country") {
      set({ selectedCountry: null, viewLevel: "world" });
    }
  },

  loadCarbonIntensity: async () => {
    if (get().carbonStatus === "loading" || get().carbonStatus === "ready") return;
    set({ carbonStatus: "loading" });
    try {
      const res = await fetch("/api/carbon");
      const data = (await res.json()) as {
        carbonIntensity: { countryCode: string; carbonIntensity: number }[];
      };
      const byCountry: Record<string, number> = {};
      for (const entry of data.carbonIntensity ?? []) {
        byCountry[entry.countryCode] = entry.carbonIntensity;
      }
      set({ carbonIntensityByCountry: byCountry, carbonStatus: "ready", carbonUpdatedAt: Date.now() });
    } catch (error) {
      console.error("Failed to load carbon intensity", error);
      set({ carbonStatus: "error" });
    }
  },

  loadGridPrices: async () => {
    if (get().gridPricesStatus === "loading" || get().gridPricesStatus === "ready") return;
    set({ gridPricesStatus: "loading" });
    try {
      const res = await fetch("/api/prices");
      const data = (await res.json()) as {
        prices: { countryCode: string; hourly: number[] }[];
      };
      const byCountry: Record<string, number[]> = {};
      for (const entry of data.prices ?? []) {
        byCountry[entry.countryCode] = entry.hourly;
      }
      set({ gridPricesByCountry: byCountry, gridPricesStatus: "ready", gridPricesUpdatedAt: Date.now() });
    } catch (error) {
      console.error("Failed to load grid prices", error);
      set({ gridPricesStatus: "error" });
    }
  },
}));
