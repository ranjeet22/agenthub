"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Agent } from "@/data/agents";
import { Avatar } from "@/components/ui/Avatar";

export interface WelcomeStateProps {
  agent: Agent;
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({
  agent,
  onSelectPrompt,
}) => {
  return (
    <div className="flex-1 w-full max-w-xl mx-auto my-auto p-4 sm:p-6 text-center flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* Centered Large Mascot — directly rendered with zero outer boundary */}
      <div className="mb-4 sm:mb-6 flex items-center justify-center">
        <Avatar
          src={agent.avatar}
          alt={agent.alt}
          size={112}
          float
          className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-sm"
        />
      </div>

      {/* Role-Specific Heading */}
      <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text tracking-tight mb-2">
        {agent.name}
      </h3>

      {/* Domain Badge */}
      <div className="mb-3">
        <span
          className="text-[11px] sm:text-xs font-mono font-medium px-2.5 py-1 rounded-sm uppercase tracking-wider inline-block"
          style={{
            backgroundColor: agent.accentTint,
            color: agent.accent,
          }}
        >
          {agent.domain} Specialist
        </span>
      </div>

      {/* Helpful Guidance */}
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6 sm:mb-8 max-w-md">
        {agent.behavior}
      </p>

      {/* Responsive Example Prompt Suggestions */}
      <div className="w-full space-y-2 text-left">
        <div className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary text-center mb-2">
          Suggested Explorations
        </div>

        {agent.examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="w-full p-3 sm:py-3 sm:px-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:shadow-2xs text-xs sm:text-sm text-text hover:text-accent transition-all duration-150 flex items-center justify-between gap-3 group text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="flex-1 leading-snug line-clamp-2 sm:line-clamp-none">
              {prompt}
            </span>
            <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
