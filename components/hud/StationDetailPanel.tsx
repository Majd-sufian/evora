"use client";

import { useEvoraStore } from "@/lib/store";
import { StationStatus } from "@/lib/types";
import { getSmartChargingRecommendation } from "@/lib/smartCharging";
import { getCurrentHourPrice } from "@/lib/gridPrice";

const STATUS_COLOR: Record<StationStatus, string> = {
  available: "text-green",
  "in-use": "text-cyan",
  unavailable: "text-red",
};

const STATUS_LABEL: Record<StationStatus, string> = {
  available: "Available",
  "in-use": "In Use",
  unavailable: "Unavailable",
};

function priceLevel(eurPerMwh: number): { label: string; className: string } {
  if (eurPerMwh <= 60) return { label: "Low", className: "text-green" };
  if (eurPerMwh <= 130) return { label: "Medium", className: "text-orange" };
  return { label: "High", className: "text-red" };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#7BA3B81A] py-3">
      <div className="text-[10px] uppercase tracking-wide text-text-secondary">{label}</div>
      <div className="mt-1 font-mono text-sm text-text-primary">{children}</div>
    </div>
  );
}

export default function StationDetailPanel() {
  const station = useEvoraStore((s) => s.selectedStation);
  const open = useEvoraStore((s) => s.stationPanelOpen);
  const goBack = useEvoraStore((s) => s.goBack);
  const gridPricesByCountry = useEvoraStore((s) => s.gridPricesByCountry);
  const gridPricesStatus = useEvoraStore((s) => s.gridPricesStatus);

  const hourly = station ? gridPricesByCountry[station.countryCode] : undefined;
  const hasLivePrices = gridPricesStatus === "ready" && hourly && hourly.length > 0;
  const currentPrice = hasLivePrices ? getCurrentHourPrice(hourly) : undefined;
  const recommendation = hasLivePrices ? getSmartChargingRecommendation(hourly) : null;

  return (
    <div
      className="fixed right-0 top-0 z-30 h-full w-full max-w-[360px] overflow-y-auto border-l border-[#00D4FF33] bg-[#0A1520F5] backdrop-blur-sm transition-transform duration-300 ease-out"
      style={{ transform: open && station ? "translateX(0)" : "translateX(100%)" }}
    >
      {station && (
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-text-primary">{station.name}</h2>
            <button
              type="button"
              onClick={goBack}
              className="text-text-secondary hover:text-text-primary"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <Field label="Address">{station.address ?? "—"}</Field>
          <Field label="Status">
            <span className={STATUS_COLOR[station.status]}>{STATUS_LABEL[station.status]}</span>
          </Field>
          <Field label="Charger Types">
            {station.connectorTypes && station.connectorTypes.length > 0
              ? station.connectorTypes.join(", ")
              : "—"}
          </Field>
          <Field label="Max Power">{station.powerKw ? `${station.powerKw} kW` : "—"}</Field>
          <Field label="Operator">{station.operator ?? "—"}</Field>
          <Field label="Current Price">
            {currentPrice !== undefined ? (
              <span>
                €{currentPrice.toFixed(0)}/MWh
                <span className={`ml-2 text-xs ${priceLevel(currentPrice).className}`}>
                  {priceLevel(currentPrice).label}
                </span>
              </span>
            ) : (
              <span className="text-text-secondary">Pending live grid price data</span>
            )}
          </Field>

          <div className="mt-4 rounded-sm border border-[#00D4FF33] bg-[#00D4FF0D] p-3">
            <div className="text-[10px] uppercase tracking-wide text-cyan">Smart Charging</div>
            <p className="mt-1 text-xs text-text-secondary">
              {recommendation
                ? recommendation.message
                : "Recommendation will appear here once the live grid price feed (ENTSO-E) is connected."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
