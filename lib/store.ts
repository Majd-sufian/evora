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

  setViewLevel: (viewLevel: ViewLevel) => void;
  setSelectedCountry: (code: string | null) => void;
  setSelectedStation: (station: ChargingStation | null) => void;
  setStationPanelOpen: (open: boolean) => void;
  toggleLayer: (layer: keyof LayerState) => void;
  loadStations: () => Promise<void>;
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

  setViewLevel: (viewLevel) => set({ viewLevel }),
  setSelectedCountry: (code) => set({ selectedCountry: code }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setStationPanelOpen: (open) => set({ stationPanelOpen: open }),
  toggleLayer: (layer) =>
    set((state) => {
      const next: LayerState = { ...state.layers, [layer]: !state.layers[layer] };
      // Grid Prices and Carbon Intensity are mutually exclusive overlays.
      if (layer === "gridPrices" && next.gridPrices) next.carbonIntensity = false;
      if (layer === "carbonIntensity" && next.carbonIntensity) next.gridPrices = false;
      return { layers: next };
    }),

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
}));
