"use client";

import { useEffect } from "react";
import { useEvoraStore } from "@/lib/store";

/** Global ESC handling: steps back one zoom level, mirroring the "← Country View" / "← Back" links. */
export default function KeyboardShortcuts() {
  const goBack = useEvoraStore((s) => s.goBack);
  const viewLevel = useEvoraStore((s) => s.viewLevel);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || viewLevel === "world") return;
      // An open modal (About/Contact) handles its own Escape to close itself.
      if (document.querySelector('[aria-modal="true"]')) return;
      goBack();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, viewLevel]);

  return null;
}
