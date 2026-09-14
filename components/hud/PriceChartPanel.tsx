"use client";

import HudPanel from "./HudPanel";
import SparkLineChart from "@/components/charts/SparkLineChart";
import { MOCK_PRICE_SERIES_EUR_MWH } from "@/lib/data/mockChartData";
import { useEvoraStore } from "@/lib/store";
import { COUNTRIES } from "@/lib/data/countries";

const DEFAULT_COUNTRY = "DE";

export default function PriceChartPanel() {
  const gridPricesByCountry = useEvoraStore((s) => s.gridPricesByCountry);
  const gridPricesStatus = useEvoraStore((s) => s.gridPricesStatus);
  const selectedCountry = useEvoraStore((s) => s.selectedCountry);
  const selectedStation = useEvoraStore((s) => s.selectedStation);

  const countryCode = selectedStation?.countryCode ?? selectedCountry ?? DEFAULT_COUNTRY;
  const countryName = COUNTRIES.find((c) => c.code === countryCode)?.name ?? countryCode;
  const realSeries = gridPricesByCountry[countryCode];

  const data = gridPricesStatus === "ready" && realSeries ? realSeries : MOCK_PRICE_SERIES_EUR_MWH;
  const current = data[data.length - 1];

  return (
    <HudPanel title={`24H GRID PRICE — ${countryName} (€/MWh)`}>
      <div className="mb-1 font-mono text-lg text-cyan">{current.toFixed(0)}</div>
      <SparkLineChart data={data} color="#00D4FF" />
    </HudPanel>
  );
}
