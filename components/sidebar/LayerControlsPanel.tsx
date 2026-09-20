"use client";

import { useEvoraStore } from "@/lib/store";
import LayerToggle from "./LayerToggle";

type LayerControlsPanelProps = {
  open: boolean;
  anchorLeft: number;
};

const LAYER_ROWS: { key: keyof ReturnType<typeof useEvoraStore.getState>["layers"]; label: string }[] = [
  { key: "chargers", label: "Live Chargers" },
  { key: "gridPrices", label: "Grid Prices" },
  { key: "carbonIntensity", label: "Carbon Intensity" },
  { key: "activityPulses", label: "Activity Pulses" },
  { key: "fastChargersOnly", label: "Fast Chargers Only" },
];

export default function LayerControlsPanel({ open, anchorLeft }: LayerControlsPanelProps) {
  const layers = useEvoraStore((s) => s.layers);
  const toggleLayer = useEvoraStore((s) => s.toggleLayer);

  return (
    <div
      className="absolute top-6 z-20 w-72 rounded-sm border border-[#00D4FF33] bg-[#0A1520F2] p-4 shadow-lg backdrop-blur-sm transition-[transform,opacity] duration-300 ease-out"
      style={{
        left: anchorLeft,
        transform: open ? "translateX(0)" : "translateX(-16px)",
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
          />
        ))}
      </div>
    </div>
  );
}
