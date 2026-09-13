import { ReactNode } from "react";

type NavItemProps = {
  icon: ReactNode;
  label: string;
  expanded: boolean;
  active?: boolean;
  onClick?: () => void;
};

export default function NavItem({ icon, label, expanded, active = false, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={expanded ? undefined : label}
      className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors ${
        active
          ? "bg-[#00D4FF1A] text-cyan"
          : "text-text-secondary hover:bg-[#00D4FF0D] hover:text-text-primary"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {expanded && (
        <span className="truncate text-xs font-medium tracking-wide">{label}</span>
      )}
    </button>
  );
}
