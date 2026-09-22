"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import HudOverlay from "@/components/hud/HudOverlay";
import Sidebar from "@/components/sidebar/Sidebar";
import DataLoader from "@/components/DataLoader";
import StationDetailPanel from "@/components/hud/StationDetailPanel";
import LoadingScreen from "@/components/LoadingScreen";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { useEvoraStore } from "@/lib/store";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
});

export default function Home() {
  const [globeReady, setGlobeReady] = useState(false);
  const stationsStatus = useEvoraStore((s) => s.stationsStatus);
  const gridPricesStatus = useEvoraStore((s) => s.gridPricesStatus);

  // "error" counts as settled (not stuck loading forever) ... an honest
  // failed/empty state is fine to reveal; a transient mock-data flash isn't.
  const stationsSettled = stationsStatus === "ready" || stationsStatus === "error";
  const gridPricesSettled = gridPricesStatus === "ready" || gridPricesStatus === "error";
  const appReady = globeReady && stationsSettled && gridPricesSettled;

  const statusLabel = !globeReady
    ? "Initializing globe"
    : !stationsSettled
      ? "Loading charger network"
      : "Loading grid price data";

  return (
    <main className="relative h-screen w-full overflow-hidden bg-bg-primary">
      <DataLoader />
      <KeyboardShortcuts />
      <Globe onReady={() => setGlobeReady(true)} />
      <HudOverlay />
      <Sidebar />
      <StationDetailPanel />
      <LoadingScreen visible={!appReady} statusLabel={statusLabel} />
    </main>
  );
}
