import NetworkStatsPanel from "./NetworkStatsPanel";
import LiveMonitorPanel from "./LiveMonitorPanel";
import PriceChartPanel from "./PriceChartPanel";
import ActivityChartPanel from "./ActivityChartPanel";

export default function HudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid grid-rows-[auto_1fr_auto] gap-4 py-6 pl-[88px] pr-6">
      <div className="flex items-start justify-between gap-4">
        <div className="pointer-events-auto w-64">
          <NetworkStatsPanel />
        </div>
        <div className="pointer-events-auto w-64">
          <LiveMonitorPanel />
        </div>
      </div>
      <div />
      <div className="flex items-end justify-between gap-4">
        <div className="pointer-events-auto w-72">
          <PriceChartPanel />
        </div>
        <div className="pointer-events-auto w-72">
          <ActivityChartPanel />
        </div>
      </div>
    </div>
  );
}
