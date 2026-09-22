"use client";

import { useState } from "react";

/** Shown only below the spec's 768px tablet cutoff (md:hidden), per the "mobile banner + simplified view" spec ... dismissible, never blocks interaction with the map underneath. */
export default function MobileBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-sm border border-[#00D4FF33] bg-[#0A1520E6] px-3 py-2 text-[11px] text-text-secondary md:hidden">
      <span>Best viewed on desktop for the full experience.</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 text-text-secondary hover:text-text-primary"
      >
        ✕
      </button>
    </div>
  );
}
