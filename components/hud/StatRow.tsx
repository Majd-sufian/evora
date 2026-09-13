type StatRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

export default function StatRow({ label, value, valueClassName = "text-text-primary" }: StatRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-0.5">
      <span className="text-[10px] uppercase tracking-wide text-text-secondary">{label}</span>
      <span className={`font-mono text-sm ${valueClassName}`}>{value}</span>
    </div>
  );
}
