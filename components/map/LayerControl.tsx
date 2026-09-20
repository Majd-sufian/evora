"use client";

import { useEffect, useRef, useState } from "react";
import { LayersIcon } from "@/components/sidebar/icons";
import LayerControlsPanel from "./LayerControlsPanel";

export default function LayerControl() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // Capture phase: the Three.js canvas (OrbitControls) stops propagation of
    // its own pointer events before they'd otherwise bubble up to document.
    document.addEventListener("mousedown", onPointerDown, true);
    return () => document.removeEventListener("mousedown", onPointerDown, true);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Data layers"
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-sm border backdrop-blur-sm transition-colors ${
          open
            ? "border-cyan bg-[#00D4FF1A] text-cyan"
            : "border-[#00D4FF33] bg-[#0A1520CC] text-text-secondary hover:text-text-primary"
        }`}
      >
        <LayersIcon />
      </button>
      <LayerControlsPanel open={open} />
    </div>
  );
}
