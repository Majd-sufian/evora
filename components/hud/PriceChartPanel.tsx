import HudPanel from "./HudPanel";
import SparkLineChart from "@/components/charts/SparkLineChart";
import { MOCK_PRICE_SERIES_EUR_MWH } from "@/lib/data/mockChartData";

export default function PriceChartPanel() {
  const current = MOCK_PRICE_SERIES_EUR_MWH[MOCK_PRICE_SERIES_EUR_MWH.length - 1];

  return (
    <HudPanel title="24H GRID PRICE (€/MWh)">
      <div className="mb-1 font-mono text-lg text-cyan">{current.toFixed(0)}</div>
      <SparkLineChart data={MOCK_PRICE_SERIES_EUR_MWH} color="#00D4FF" />
    </HudPanel>
  );
}
