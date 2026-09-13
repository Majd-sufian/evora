"use client";

import dynamic from "next/dynamic";
import HudOverlay from "@/components/hud/HudOverlay";
import Sidebar from "@/components/sidebar/Sidebar";
import DataLoader from "@/components/DataLoader";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-bg-primary">
      <DataLoader />
      <Globe />
      <HudOverlay />
      <Sidebar />
    </main>
  );
}
