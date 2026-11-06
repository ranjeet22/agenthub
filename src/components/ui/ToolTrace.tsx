import React, { useState } from "react";
import { ChevronRight, Terminal, Clock, CheckCircle2 } from "lucide-react";

export interface ToolTraceProps {
  tool: string;
  duration?: string;
  resultCount?: number;
  args?: Record<string, any>;
  defaultOpen?: boolean;
  className?: string;
}

export const ToolTrace: React.FC<ToolTraceProps> = ({
  tool,
  duration = "240ms",
  resultCount = 3,
  args = {},
  defaultOpen = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-bg-subtle border border-border rounded-sm overflow-hidden text-[13px] font-mono transition-colors ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full h-9 px-3 flex items-center justify-between text-left text-text hover:bg-border/20 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <ChevronRight
            className={`w-3.5 h-3.5 text-text-tertiary transition-transform duration-150 shrink-0 ${
              isOpen ? "rotate-90 text-accent" : ""
            }`}
          />
          <Terminal className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          <span className="font-medium text-text truncate">{tool}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </span>
          <span className="flex items-center gap-1 text-status-success">
            <CheckCircle2 className="w-3 h-3" />
            {resultCount} results
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-3 bg-bg border-t border-border text-xs overflow-x-auto text-text-secondary leading-relaxed">
          <div className="text-text-tertiary mb-1 font-semibold uppercase text-[10px] tracking-wider">
            Tool Arguments:
          </div>
          <pre className="text-text/90 bg-bg-subtle/50 p-2 rounded border border-border/50 overflow-x-auto">
            {JSON.stringify(args, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
