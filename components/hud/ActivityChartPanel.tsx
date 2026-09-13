import HudPanel from "./HudPanel";
import SparkLineChart from "@/components/charts/SparkLineChart";
import { SIMULATED_ACTIVITY_SERIES } from "@/lib/data/mockChartData";

export default function ActivityChartPanel() {
  return (
    <HudPanel title="NETWORK ACTIVITY (SIMULATED)">
      <SparkLineChart data={SIMULATED_ACTIVITY_SERIES} color="#00FF88" />
    </HudPanel>
  );
}
