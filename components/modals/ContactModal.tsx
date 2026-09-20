"use client";

import Modal from "./Modal";

type ContactModalProps = {
  onClose: () => void;
};

const CONTACT_EMAIL = "majd.sufyan.t@gmail.com";

export default function ContactModal({ onClose }: ContactModalProps) {
  return (
    <Modal title="Contact" onClose={onClose}>
      <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
        <p>Questions about Evora or want to get in touch?</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-block font-mono text-sm text-cyan hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </Modal>
  );
}
