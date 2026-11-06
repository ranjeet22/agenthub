"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Agent } from "@/data/agents";
import { Avatar } from "@/components/ui/Avatar";

export interface AgentSelectionCardProps {
  agent: Agent;
}

export const AgentSelectionCard: React.FC<AgentSelectionCardProps> = ({ agent }) => {
  return (
    <Link
      href={`/chat/${agent.id}`}
      aria-label={`Select ${agent.name}, ${agent.domain}`}
      className="group relative bg-surface border border-border rounded-xl p-3.5 sm:p-5 lg:p-7 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent select-none w-full"
    >
      {/* 3px Top Accent Stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl transition-opacity opacity-70 group-hover:opacity-100"
        style={{ backgroundColor: agent.accent }}
      />

      {/* Large Mascot Avatar — responsive direct squircle with zero outer boundary */}
      <div className="mb-3 sm:mb-4 lg:mb-5 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
        <Avatar
          src={agent.avatar}
          alt={agent.alt}
          size={112}
          float={false}
          className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 drop-shadow-sm"
        />
      </div>

      {/* Agent Name */}
      <h3 className="text-sm sm:text-lg lg:text-2xl font-semibold text-text tracking-tight mb-1 sm:mb-2 group-hover:text-accent transition-colors">
        {agent.name}
      </h3>

      {/* Short Behavior Description */}
      <p className="text-[11px] sm:text-xs lg:text-sm text-text-secondary leading-relaxed mb-3 sm:mb-6 max-w-xs flex-1 line-clamp-3 sm:line-clamp-none">
        {agent.behavior}
      </p>

      {/* Hover Action Badge: "Pick your agent" */}
      <div className="mt-auto w-full pt-1 sm:pt-2 flex items-center justify-center">
        <span
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-pill text-[11px] sm:text-xs font-medium transition-all duration-200 opacity-80 group-hover:opacity-100 group-hover:scale-102"
          style={{
            backgroundColor: agent.accentTint,
            color: agent.accent,
          }}
        >
          <span>Pick your agent</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
};
