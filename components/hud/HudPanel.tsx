import { ReactNode } from "react";

type HudPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function HudPanel({ title, children, className = "" }: HudPanelProps) {
  return (
    <div
      className={`hud-scanlines relative overflow-hidden rounded-sm border border-[#00D4FF33] bg-[#0A1520CC] px-4 py-3 backdrop-blur-sm ${className}`}
    >
      <h2 className="font-display text-[11px] font-semibold tracking-[0.15em] text-text-secondary">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
