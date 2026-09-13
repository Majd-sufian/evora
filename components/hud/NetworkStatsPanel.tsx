import HudPanel from "./HudPanel";
import StatRow from "./StatRow";
import { MOCK_STATIONS } from "@/lib/data/mockStations";

export default function NetworkStatsPanel() {
  return (
    <HudPanel title="NETWORK STATS">
      <StatRow label="Live Stations Active" value={String(MOCK_STATIONS.length)} valueClassName="text-green" />
      <StatRow label="Network Utilization" value="62%" />
      <StatRow label="Current Charge" value="14.2 MW" />
      <StatRow label="Last Update" value="—" />
    </HudPanel>
  );
}
