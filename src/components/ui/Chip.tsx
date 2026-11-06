import React from "react";

export interface ChipProps {
  children: React.ReactNode;
  variant?: "neutral" | "orby" | "biblio" | "cosmo" | "atlas" | "breeze" | "palette" | "success" | "warning";
  className?: string;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = "neutral",
  className = "",
  icon,
}) => {
  const variantStyles = {
    neutral: "bg-bg-subtle text-text-secondary border-border",
    orby: "bg-agent-orby-tint text-agent-orby border-transparent",
    biblio: "bg-agent-biblio-tint text-agent-biblio border-transparent",
    cosmo: "bg-agent-cosmo-tint text-agent-cosmo border-transparent",
    atlas: "bg-agent-atlas-tint text-agent-atlas border-transparent",
    breeze: "bg-agent-breeze-tint text-agent-breeze border-transparent",
    palette: "bg-agent-palette-tint text-agent-palette border-transparent",
    success: "bg-status-success-tint text-status-success border-transparent",
    warning: "bg-status-warning-tint text-status-warning border-transparent",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-7 px-2.5 text-[13px] font-medium rounded-sm border ${variantStyles[variant]} select-none transition-colors ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
