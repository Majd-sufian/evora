"use client";

import HudPanel from "./HudPanel";
import StatRow from "./StatRow";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { useEvoraStore } from "@/lib/store";

export default function NetworkStatsPanel() {
  const fastChargersOnly = useEvoraStore((s) => s.layers.fastChargersOnly);
  const activeCount = fastChargersOnly
    ? MOCK_STATIONS.filter((s) => (s.powerKw ?? 0) >= 50).length
    : MOCK_STATIONS.length;

  return (
    <HudPanel title="NETWORK STATS">
      <StatRow label="Live Stations Active" value={String(activeCount)} valueClassName="text-green" />
      <StatRow label="Network Utilization" value="62%" />
      <StatRow label="Current Charge" value="14.2 MW" />
      <StatRow label="Last Update" value="—" />
    </HudPanel>
  );
}
