type LayerToggleProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
  /** Shown under the label when the layer is on but has nothing to show, e.g. no live data. */
  note?: string;
};

export default function LayerToggle({ label, checked, onChange, note }: LayerToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full flex-col items-start gap-1 py-2"
    >
      <span className="flex w-full items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs text-text-primary">{label}</span>
        <span
          className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
            checked ? "bg-cyan" : "bg-[#1A2833]"
          }`}
        >
          <span
            // `left` is set explicitly (not left as `auto`) — verified live
            // that without it, the browser computed this absolutely
            // positioned thumb's static position as 16px instead of 0px,
            // silently adding 16px on top of both translate values below
            // and pushing the "on" thumb fully outside the track.
            className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-bg-primary transition-transform ${
              checked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </span>
      </span>
      {checked && note && (
        <span className="text-left text-[10px] leading-snug text-text-secondary">{note}</span>
      )}
    </button>
  );
}
