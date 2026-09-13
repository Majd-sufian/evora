"use client";

import { useEvoraStore } from "@/lib/store";

export default function CarbonLegend() {
  const carbonLayerOn = useEvoraStore((s) => s.layers.carbonIntensity);
  const carbonStatus = useEvoraStore((s) => s.carbonStatus);

  if (!carbonLayerOn || carbonStatus !== "ready") return null;

  return (
    <div className="pointer-events-auto mx-auto flex w-fit items-center gap-3 rounded-sm border border-[#00D4FF33] bg-[#0A1520CC] px-4 py-2 backdrop-blur-sm">
      <span className="text-[10px] uppercase tracking-wide text-text-secondary">
        Carbon Intensity (gCO₂/kWh)
      </span>
      <div className="h-2 w-32 rounded-full bg-gradient-to-r from-green via-orange to-red" />
      <span className="text-[10px] text-text-secondary">Low → High</span>
    </div>
  );
}
