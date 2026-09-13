"use client";

import HudPanel from "./HudPanel";
import StatRow from "./StatRow";
import { MOCK_STATIONS } from "@/lib/data/mockStations";
import { useEvoraStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/format";
import { COUNTRIES } from "@/lib/data/countries";

function BackLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2 text-[10px] uppercase tracking-wide text-cyan hover:underline"
    >
      ← {label}
    </button>
  );
}

export default function NetworkStatsPanel() {
  const fastChargersOnly = useEvoraStore((s) => s.layers.fastChargersOnly);
  const stations = useEvoraStore((s) => s.stations);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const stationsUpdatedAt = useEvoraStore((s) => s.stationsUpdatedAt);
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const selectedCountry = useEvoraStore((s) => s.selectedCountry);
  const selectedStation = useEvoraStore((s) => s.selectedStation);
  const goBack = useEvoraStore((s) => s.goBack);

  const source = stationsStatus === "ready" && stations.length > 0 ? stations : MOCK_STATIONS;

  if (viewLevel === "country" && selectedCountry) {
    const country = COUNTRIES.find((c) => c.code === selectedCountry);
    const countryStations = source.filter((s) => s.countryCode === selectedCountry);
    const available = countryStations.filter((s) => s.status === "available").length;
    const fastCount = countryStations.filter((s) => (s.powerKw ?? 0) >= 50).length;

    return (
      <HudPanel title={`COUNTRY — ${country?.name ?? selectedCountry}`}>
        <BackLink onClick={goBack} label="World View" />
        <StatRow label="Stations" value={String(countryStations.length)} valueClassName="text-green" />
        <StatRow label="Available" value={String(available)} />
        <StatRow label="Fast Chargers (50kW+)" value={String(fastCount)} />
      </HudPanel>
    );
  }

  if (viewLevel === "station" && selectedStation) {
    return (
      <HudPanel title="STATION VIEW">
        <BackLink onClick={goBack} label="Back" />
        <StatRow label="Station" value={selectedStation.name} />
        <StatRow label="Status" value={selectedStation.status} />
      </HudPanel>
    );
  }

  const activeCount = fastChargersOnly
    ? source.filter((s) => (s.powerKw ?? 0) >= 50).length
    : source.length;

  return (
    <HudPanel title="NETWORK STATS">
      <StatRow label="Live Stations Active" value={activeCount.toLocaleString("en-US")} valueClassName="text-green" />
      <StatRow label="Network Utilization" value="62%" />
      <StatRow label="Current Charge" value="14.2 MW" />
      <StatRow label="Last Update" value={formatRelativeTime(stationsUpdatedAt)} />
    </HudPanel>
  );
}
