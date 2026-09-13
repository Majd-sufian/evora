"use client";

import { useEffect } from "react";
import { useEvoraStore } from "@/lib/store";

export default function DataLoader() {
  const loadStations = useEvoraStore((s) => s.loadStations);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  return null;
}
