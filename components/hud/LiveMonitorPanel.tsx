"use client";

import HudPanel from "./HudPanel";
import StatRow from "./StatRow";
import { COUNTRIES } from "@/lib/data/countries";
import { useEvoraStore } from "@/lib/store";

const MOCK_TOTAL_CHARGERS = COUNTRIES.reduce((sum, c) => sum + c.stationCount, 0);

export default function LiveMonitorPanel() {
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);

  const totalChargers = stationsStatus === "ready" && stations.length > 0
    ? stations.length
    : MOCK_TOTAL_CHARGERS;

  return (
    <HudPanel title="LIVE EV NETWORK MONITOR">
      <StatRow label="Total Chargers" value={totalChargers.toLocaleString("en-US")} valueClassName="text-cyan" />
      <StatRow label="Countries Covered" value={String(COUNTRIES.length)} />
      <StatRow label="Data Sources" value="3" />
    </HudPanel>
  );
}
