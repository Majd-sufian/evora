"use client";

import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-bg-primary">
      <Globe />
    </main>
  );
}
