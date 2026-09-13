"use client";

import HudPanel from "./HudPanel";
import StatRow from "./StatRow";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { useEvoraStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/format";

export default function NetworkStatsPanel() {
  const fastChargersOnly = useEvoraStore((s) => s.layers.fastChargersOnly);
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const stationsUpdatedAt = useEvoraStore((s) => s.stationsUpdatedAt);

  const source = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;
  const activeCount = fastChargersOnly
    ? source.filter((s) => (s.powerKw ?? 0) >= 50).length
    : source.length;

  return (
    <HudPanel title="NETWORK STATS">
      <StatRow label="Live Stations Active" value={activeCount.toLocaleString("en-US")} valueClassName="text-green" />
      <StatRow label="Network Utilization" value="62%" />
      <StatRow label="Current Charge" value="14.2 MW" />
      <StatRow label="Last Update" value={formatRelativeTime(stationsUpdatedAt)} />
    </HudPanel>
  );
}
