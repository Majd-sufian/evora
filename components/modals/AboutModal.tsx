"use client";

import Modal from "./Modal";

type AboutModalProps = {
  onClose: () => void;
};

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <Modal title="About Evora" onClose={onClose}>
      <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
        <p>
          Evora is a real-time EV charging intelligence dashboard for Europe —
          live charger locations, grid electricity prices, and carbon
          intensity brought together on one interactive globe.
        </p>
        <p>
          It&apos;s a solo-built portfolio project, not a commercial product:
          a way to get hands-on with real-time data integrations
          (OpenChargeMap, ENTSO-E, Electricity Maps) and a Three.js-driven
          interface end to end.
        </p>
      </div>
    </Modal>
  );
}
