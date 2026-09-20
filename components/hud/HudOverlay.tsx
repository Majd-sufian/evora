import NetworkStatsPanel from "./NetworkStatsPanel";
import LiveMonitorPanel from "./LiveMonitorPanel";
import PriceChartPanel from "./PriceChartPanel";
import ActivityChartPanel from "./ActivityChartPanel";
import CarbonLegend from "./CarbonLegend";
import GridPriceLegend from "./GridPriceLegend";
import SearchBar from "./SearchBar";
import LayerControl from "@/components/map/LayerControl";

export default function HudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid grid-rows-[auto_1fr_auto] gap-4 py-6 pl-[88px] pr-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
        <div className="pointer-events-auto w-64 justify-self-start">
          <NetworkStatsPanel />
        </div>
        <div className="pointer-events-auto justify-self-center">
          <SearchBar />
        </div>
        <div className="pointer-events-auto w-64 justify-self-end">
          <LiveMonitorPanel />
        </div>
      </div>
      <div className="flex items-center justify-end">
        <div className="pointer-events-auto">
          <LayerControl />
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="pointer-events-auto w-72">
          <PriceChartPanel />
        </div>
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <CarbonLegend />
          <GridPriceLegend />
        </div>
        <div className="pointer-events-auto w-72">
          <ActivityChartPanel />
        </div>
      </div>
    </div>
  );
}
