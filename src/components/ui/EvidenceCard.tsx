import React from "react";
import {
  FileText,
  BookOpen,
  Image as ImageIcon,
  Database,
  Activity,
  Palette as PaletteIcon,
  ExternalLink,
} from "lucide-react";
import { Chip } from "./Chip";

export interface EvidenceCardProps {
  variant?: "paper" | "book" | "image" | "entity" | "measurement" | "artwork";
  title: string;
  authors: string;
  source: string;
  domain: string;
  url: string;
  metadata: string;
  agentColor?: string;
  agentTint?: string;
  className?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  variant = "paper",
  title,
  authors,
  source,
  domain,
  url,
  metadata,
  agentColor = "var(--accent)",
  agentTint = "var(--accent-tint)",
  className = "",
}) => {
  const getIcon = () => {
    switch (variant) {
      case "paper":
        return <FileText className="w-4 h-4" />;
      case "book":
        return <BookOpen className="w-4 h-4" />;
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "entity":
        return <Database className="w-4 h-4" />;
      case "measurement":
        return <Activity className="w-4 h-4" />;
      case "artwork":
        return <PaletteIcon className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`group relative bg-surface border border-border rounded-md p-4 transition-all duration-150 hover:border-border-strong hover:shadow-sm ${className}`}
    >
      {/* Top row: Icon + Type tag + Domain chip + External Link */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: agentTint, color: agentColor }}
          >
            {getIcon()}
          </div>
          <span className="text-xs font-mono font-medium text-text-tertiary uppercase tracking-wider">
            {variant}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Chip variant="neutral" className="text-[11px] h-6 px-2">
            {domain}
          </Chip>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-tertiary hover:text-accent transition-colors p-1"
            title="Open primary source"
            aria-label={`Open primary source: ${title}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-text line-clamp-1 mb-1 group-hover:text-accent transition-colors">
        {title}
      </h4>

      {/* Authors / Attributions */}
      <p className="text-xs text-text-secondary line-clamp-1 mb-2">
        {authors}
      </p>

      {/* Bottom Metadata & Source Citation */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-[11px] text-text-tertiary font-mono">
        <span className="truncate">{source}</span>
        <span className="shrink-0 text-text-tertiary/80">{metadata}</span>
      </div>
    </div>
  );
};
