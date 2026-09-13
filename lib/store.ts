import { create } from "zustand";
import { ChargingStation, LayerState, ViewLevel } from "./types";

type EvoraStore = {
  viewLevel: ViewLevel;
  selectedCountry: string | null;
  selectedStation: ChargingStation | null;
  layers: LayerState;
  stationPanelOpen: boolean;

  setViewLevel: (viewLevel: ViewLevel) => void;
  setSelectedCountry: (code: string | null) => void;
  setSelectedStation: (station: ChargingStation | null) => void;
  setStationPanelOpen: (open: boolean) => void;
  toggleLayer: (layer: keyof LayerState) => void;
};

export const useEvoraStore = create<EvoraStore>((set) => ({
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
}));
