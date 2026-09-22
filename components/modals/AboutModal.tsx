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
          Evora is a real-time EV charging intelligence dashboard for Europe ...
          live charger locations, grid electricity prices, and carbon
          intensity brought together on one interactive globe.
        </p>
      </div>
    </Modal>
  );
}
