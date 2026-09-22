"use client";

import { useEffect } from "react";
import { useEvoraStore } from "@/lib/store";

export default function DataLoader() {
  const loadStations = useEvoraStore((s) => s.loadStations);
  const loadGridPrices = useEvoraStore((s) => s.loadGridPrices);
  const loadCarbonIntensity = useEvoraStore((s) => s.loadCarbonIntensity);

  useEffect(() => {
    loadStations();
    // Loaded eagerly (not gated behind the Grid Prices layer toggle) since the
    // Smart Charging recommendation needs it regardless of that layer's state.
    loadGridPrices();
    // Carbon Intensity defaults to on (lib/store.ts), so its data must load
    // up front too ... otherwise the layer would render empty until the user
    // manually toggled it off and back on.
    loadCarbonIntensity();
  }, [loadStations, loadGridPrices, loadCarbonIntensity]);

  return null;
}
