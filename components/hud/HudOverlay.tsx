import NetworkStatsPanel from "./NetworkStatsPanel";
import LiveMonitorPanel from "./LiveMonitorPanel";
import PriceChartPanel from "./PriceChartPanel";
import ActivityChartPanel from "./ActivityChartPanel";
import CarbonLegend from "./CarbonLegend";
import GridPriceLegend from "./GridPriceLegend";
import SearchBar from "./SearchBar";
import MobileBanner from "./MobileBanner";
import LayerControl from "@/components/map/LayerControl";

export default function HudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3 overflow-y-auto py-3 pl-20 pr-3 md:gap-4 md:py-6 md:pl-24 md:pr-6 lg:pl-[88px]">
      <MobileBanner />

      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="pointer-events-auto w-full md:w-56 lg:w-64">
          <NetworkStatsPanel />
        </div>
        <div className="pointer-events-auto flex w-full justify-center md:w-auto md:flex-1">
          <SearchBar />
        </div>
        {/* Simplified view on mobile per spec: skip the secondary monitor panel. */}
        <div className="pointer-events-auto hidden w-full md:block md:w-56 lg:w-64">
          <LiveMonitorPanel />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="pointer-events-auto">
          <LayerControl />
        </div>
      </div>

      {/* Charts + legends are desktop/tablet-only — hidden on mobile to keep the simplified view uncluttered. */}
      <div className="mt-auto hidden items-end justify-between gap-3 md:flex md:gap-4">
        <div className="pointer-events-auto w-56 lg:w-72">
          <PriceChartPanel />
        </div>
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <CarbonLegend />
          <GridPriceLegend />
        </div>
        <div className="pointer-events-auto w-56 lg:w-72">
          <ActivityChartPanel />
        </div>
      </div>
    </div>
  );
}
