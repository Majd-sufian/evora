import HudPanel from "./HudPanel";
import StatRow from "./StatRow";
import { COUNTRIES } from "@/lib/data/countries";

const TOTAL_CHARGERS = COUNTRIES.reduce((sum, c) => sum + c.stationCount, 0);

export default function LiveMonitorPanel() {
  return (
    <HudPanel title="LIVE EV NETWORK MONITOR">
      <StatRow label="Total Chargers" value={TOTAL_CHARGERS.toLocaleString("en-US")} valueClassName="text-cyan" />
      <StatRow label="Countries Covered" value={String(COUNTRIES.length)} />
      <StatRow label="Data Sources" value="3" />
    </HudPanel>
  );
}
