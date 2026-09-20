type LayerToggleProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

export default function LayerToggle({ label, checked, onChange }: LayerToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 py-2"
    >
      <span className="min-w-0 truncate text-xs text-text-primary">{label}</span>
      <span
        className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
          checked ? "bg-cyan" : "bg-[#1A2833]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-bg-primary transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
