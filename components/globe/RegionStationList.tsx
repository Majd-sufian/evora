"use client";

import { Html } from "@react-three/drei";
import { ChargingStation, StationStatus } from "@/lib/types";
import { StationCluster } from "@/lib/clustering";
import { useEvoraStore } from "@/lib/store";

const STATUS_DOT: Record<StationStatus, string> = {
  available: "bg-green",
  "in-use": "bg-cyan",
  unavailable: "bg-red",
};

type RegionStationListProps = {
  cluster: StationCluster;
  label: string;
  stations: ChargingStation[];
};

/**
 * A floating, screen-space-anchored list of a region's member stations,
 * opened by clicking a region badge in Country View. Replaces the old
 * spiderfy-ring drill-down — picking a station here jumps straight to it by
 * id (setSelectedStation), so there's no ambiguity between what's clicked
 * and what's selected, unlike overlapping globe icons.
 */
export default function RegionStationList({ cluster, label, stations }: RegionStationListProps) {
  const setSelectedRegionCluster = useEvoraStore((s) => s.setSelectedRegionCluster);
  const setSelectedStation = useEvoraStore((s) => s.setSelectedStation);
  const setViewLevel = useEvoraStore((s) => s.setViewLevel);
  const setStationPanelOpen = useEvoraStore((s) => s.setStationPanelOpen);

  const ids = new Set(cluster.stationIds);
  const members = stations.filter((s) => ids.has(s.id));

  return (
    <Html style={{ pointerEvents: "none" }} zIndexRange={[50, 0]} occlude={false}>
      <div
        className="hud-scanlines w-64 -translate-y-1/2 translate-x-6 overflow-hidden rounded-sm border border-[#00D4FF33] bg-[#0A1520F2] backdrop-blur-sm"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#7BA3B81A] px-3 py-2">
          <div className="min-w-0">
            <div className="truncate font-display text-[11px] font-semibold tracking-[0.1em] text-text-primary">{label}</div>
            <div className="text-[10px] text-text-secondary">{members.length} stations</div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRegionCluster(null)}
            className="shrink-0 text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {members.map((station) => (
            <button
              key={station.id}
              type="button"
              onClick={() => {
                setSelectedStation(station);
                setViewLevel("station");
                setStationPanelOpen(true);
              }}
              className="flex w-full items-center gap-2 border-b border-[#7BA3B80D] px-3 py-2 text-left hover:bg-[#00D4FF0D]"
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[station.status]}`} />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-primary">{station.name}</span>
              {station.powerKw !== undefined && (
                <span className="shrink-0 font-mono text-[10px] text-text-secondary">{station.powerKw}kW</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </Html>
  );
}
