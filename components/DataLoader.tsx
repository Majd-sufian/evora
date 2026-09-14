"use client";

import { useEffect } from "react";
import { useEvoraStore } from "@/lib/store";

export default function DataLoader() {
  const loadStations = useEvoraStore((s) => s.loadStations);
  const loadGridPrices = useEvoraStore((s) => s.loadGridPrices);

  useEffect(() => {
    loadStations();
    // Loaded eagerly (not gated behind the Grid Prices layer toggle) since the
    // Smart Charging recommendation needs it regardless of that layer's state.
    loadGridPrices();
  }, [loadStations, loadGridPrices]);

  return null;
}
