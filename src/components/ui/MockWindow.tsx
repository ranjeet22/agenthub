import React from "react";

export interface MockWindowProps {
  children: React.ReactNode;
  address?: string;
  className?: string;
  titleBarClassName?: string;
}

export const MockWindow: React.FC<MockWindowProps> = ({
  children,
  address = "agenthub.workspace / research-canvas",
  className = "",
  titleBarClassName = "",
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-lg overflow-hidden flex flex-col transition-all ${className}`}
    >
      {/* Window Title Bar */}
      <div
        className={`h-11 px-4 border-b border-border bg-bg-subtle/80 flex items-center justify-between gap-4 select-none ${titleBarClassName}`}
      >
        {/* Three Window Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-border-strong inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-border-strong inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-border-strong inline-block" />
        </div>

        {/* Address Bar Pill */}
        <div className="flex-1 max-w-sm mx-auto h-6 px-3 bg-surface/80 border border-border rounded-pill flex items-center justify-center text-[11px] font-mono text-text-tertiary truncate">
          <span className="truncate">{address}</span>
        </div>

        {/* Spacer for symmetry */}
        <div className="w-12 shrink-0 hidden sm:block" />
      </div>

      {/* Window Body */}
      <div className="p-4 sm:p-6 flex-1 bg-surface">{children}</div>
    </div>
  );
};
