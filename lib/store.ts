import { create } from "zustand";
import { ChargingStation, LayerState, ViewLevel } from "./types";

type DataStatus = "idle" | "loading" | "ready" | "error";

type EvoraStore = {
  viewLevel: ViewLevel;
  selectedCountry: string | null;
  selectedStation: ChargingStation | null;
  layers: LayerState;
  stationPanelOpen: boolean;

  stations: ChargingStation[];
  stationsStatus: DataStatus;
  stationsUpdatedAt: number | null;

  carbonIntensityByCountry: Record<string, number>;
  carbonStatus: DataStatus;
  carbonUpdatedAt: number | null;

  setViewLevel: (viewLevel: ViewLevel) => void;
  setSelectedCountry: (code: string | null) => void;
  setSelectedStation: (station: ChargingStation | null) => void;
  setStationPanelOpen: (open: boolean) => void;
  toggleLayer: (layer: keyof LayerState) => void;
  loadStations: () => Promise<void>;
  loadCarbonIntensity: () => Promise<void>;
  /** Steps back one zoom level: station -> country (or world) -> world. */
  goBack: () => void;
};

export const useEvoraStore = create<EvoraStore>((set, get) => ({
  viewLevel: "world",
  selectedCountry: null,
  selectedStation: null,
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

  setViewLevel: (viewLevel) => set({ viewLevel }),
  setSelectedCountry: (code) => set({ selectedCountry: code }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setStationPanelOpen: (open) => set({ stationPanelOpen: open }),
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
    const { viewLevel, selectedCountry } = get();
    if (viewLevel === "station") {
      set({
        selectedStation: null,
        stationPanelOpen: false,
        viewLevel: selectedCountry ? "country" : "world",
      });
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
}));
