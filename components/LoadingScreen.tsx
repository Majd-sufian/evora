type LoadingScreenProps = {
  statusLabel: string;
  visible: boolean;
};

export default function LoadingScreen({ statusLabel, visible }: LoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg-primary transition-opacity duration-300 ease-out"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      aria-hidden={!visible}
    >
      <div className="font-display text-2xl font-semibold tracking-[0.3em] text-cyan">EVORA</div>
      <div className="h-px w-48 overflow-hidden bg-[#00D4FF1A]">
        <div className="h-full w-1/3 animate-loading-sweep bg-cyan" />
      </div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">{statusLabel}</div>
    </div>
  );
}
