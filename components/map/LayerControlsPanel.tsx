"use client";

import { useEvoraStore } from "@/lib/store";
import LayerToggle from "./LayerToggle";

type LayerControlsPanelProps = {
  open: boolean;
};

const LAYER_ROWS: { key: keyof ReturnType<typeof useEvoraStore.getState>["layers"]; label: string }[] = [
  { key: "chargers", label: "Live Chargers" },
  { key: "gridPrices", label: "Grid Prices" },
  { key: "carbonIntensity", label: "Carbon Intensity" },
  { key: "activityPulses", label: "Activity Pulses" },
  { key: "fastChargersOnly", label: "Fast Chargers Only" },
];

export default function LayerControlsPanel({ open }: LayerControlsPanelProps) {
  const layers = useEvoraStore((s) => s.layers);
  const toggleLayer = useEvoraStore((s) => s.toggleLayer);
  const gridPricesStatus = useEvoraStore((s) => s.gridPricesStatus);

  return (
    <div
      className="absolute right-0 top-full z-20 mt-2 max-h-[min(70vh,26rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-sm border border-[#00D4FF33] bg-[#0A1520F2] p-4 shadow-lg backdrop-blur-sm transition-[transform,opacity] duration-300 ease-out"
      style={{
        transform: open ? "translateY(0)" : "translateY(-8px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <h2 className="font-display text-[11px] font-semibold tracking-[0.15em] text-text-secondary">
        DATA LAYERS
      </h2>
      <div className="mt-2 divide-y divide-[#7BA3B81A]">
        {LAYER_ROWS.map((row) => (
          <LayerToggle
            key={row.key}
            label={row.label}
            checked={layers[row.key]}
            onChange={() => toggleLayer(row.key)}
            note={row.key === "gridPrices" && gridPricesStatus === "error" ? "Live price data unavailable" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
