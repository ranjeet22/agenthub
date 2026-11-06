"use client";

import React from "react";
import { Menu, Terminal, Trash2 } from "lucide-react";
import { Agent } from "@/data/agents";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface AgentHeaderProps {
  agent: Agent;
  onOpenMobileSidebar: () => void;
  onClearChat?: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  agent,
  onOpenMobileSidebar,
  onClearChat,
}) => {
  return (
    <header className="relative w-full border-b border-border bg-surface/90 backdrop-blur-md px-3.5 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 z-20">
      {/* 2.5px Top Accent Stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px]"
        style={{ backgroundColor: agent.accent }}
      />

      {/* Left: Mobile Menu Button + Agent Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open agents menu"
          className="md:hidden p-2 rounded-md text-text hover:bg-bg-subtle border border-border shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Avatar
          src={agent.avatar}
          alt={agent.alt}
          size={40}
          className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-text tracking-tight truncate">
              {agent.name}
            </h2>
            <span
              className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 rounded-sm shrink-0"
              style={{
                backgroundColor: agent.accentTint,
                color: agent.accent,
              }}
            >
              {agent.domain}
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-text-secondary truncate hidden md:block max-w-lg">
            {agent.behavior}
          </p>
        </div>
      </div>

      {/* Right: Connected Tool Chips, Clear Chat & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Tool Chips (hidden on smaller screens, visible on lg+) */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-text-tertiary mr-1">
            Tools:
          </span>
          {agent.tools.map((tool) => (
            <Chip
              key={tool}
              variant="neutral"
              className="text-[11px] h-6 px-2 font-mono"
              icon={<Terminal className="w-3 h-3 text-text-tertiary" />}
            >
              {tool}
            </Chip>
          ))}
        </div>

        {/* Clear Chat Button */}
        {onClearChat && (
          <button
            type="button"
            onClick={onClearChat}
            title={`Clear ${agent.name}'s conversation history`}
            className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
            aria-label="Clear conversation history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
};
