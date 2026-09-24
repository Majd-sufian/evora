import NetworkStatsPanel from "./NetworkStatsPanel";
import LiveMonitorPanel from "./LiveMonitorPanel";
import PriceChartPanel from "./PriceChartPanel";
import ActivityChartPanel from "./ActivityChartPanel";
import CarbonLegend from "./CarbonLegend";
import GridPriceLegend from "./GridPriceLegend";
import MobileBanner from "./MobileBanner";
import LayerControl from "@/components/map/LayerControl";

export default function HudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3 overflow-y-auto py-3 pl-20 pr-3 md:gap-4 md:py-6 md:pl-24 md:pr-6 lg:pl-[88px]">
      <MobileBanner />

      {/* Mobile-only (<768px): the layer control sits right under the
          banner, near the top where the panel always has room to open
          downward; Network Stats is pushed to the bottom below. Search is
          temporarily disabled — see SearchBar.tsx. */}
      <div className="flex w-full items-center justify-center gap-2 md:hidden">
        <div className="pointer-events-auto shrink-0">
          <LayerControl />
        </div>
      </div>

      {/* Tablet/desktop (768px+): original side-by-side row, with the layer
          control stacked below the monitor panel instead of floating alone
          in the empty space below — keeps it near the top HUD cluster.
          Search is temporarily disabled — see SearchBar.tsx. */}
      <div className="hidden md:flex md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="pointer-events-auto md:w-56 lg:w-64">
          <NetworkStatsPanel />
        </div>
        <div className="flex flex-col items-end gap-2 md:w-56 lg:w-64">
          <div className="pointer-events-auto w-full">
            <LiveMonitorPanel />
          </div>
          <div className="pointer-events-auto">
            <LayerControl />
          </div>
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

      {/* Mobile-only: Network Stats pushed down to the bottom of the screen. */}
      <div className="pointer-events-auto mt-auto w-full md:hidden">
        <NetworkStatsPanel />
      </div>
    </div>
  );
}
