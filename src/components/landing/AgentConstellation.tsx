"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { AGENTS, Agent } from "@/data/agents";
import { Avatar } from "../ui/Avatar";

export interface AgentConstellationProps {
  onSelectAgent: (agentId: Agent["id"]) => void;
}

export const AgentConstellation: React.FC<AgentConstellationProps> = ({
  onSelectAgent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Desktop arc positioning offsets and rotation for hand-arranged aesthetic
  // Arranged in a graceful wide upper arc around the central button
  const avatarLayouts = [
    { id: "orby", xDesktop: -240, yDesktop: -110, rotate: "-5deg", mobileOrder: 1 },
    { id: "biblio", xDesktop: -150, yDesktop: -170, rotate: "3deg", mobileOrder: 2 },
    { id: "cosmo", xDesktop: -50, yDesktop: -195, rotate: "-3deg", mobileOrder: 3 },
    { id: "atlas", xDesktop: 50, yDesktop: -195, rotate: "4deg", mobileOrder: 4 },
    { id: "breeze", xDesktop: 150, yDesktop: -170, rotate: "-4deg", mobileOrder: 5 },
    { id: "palette", xDesktop: 240, yDesktop: -110, rotate: "5deg", mobileOrder: 6 },
  ];

  return (
    <section className="relative w-full py-12 sm:py-20 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Dotted Canvas */}
      <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1200px] px-4 flex flex-col items-center">
        {/* Constellation Workspace Stage */}
        <div className="relative w-full max-w-2xl min-h-[260px] sm:min-h-[340px] flex items-center justify-center">
          {/* Central Dark Squircle Plus/X Control Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Hide agents" : "Show agents"}
            className="group relative z-30 w-16 h-16 sm:w-20 sm:h-20 bg-text text-bg rounded-[24%] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Plus
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 absolute ${
                  isExpanded ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 absolute ${
                  isExpanded ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                }`}
              />
            </div>
          </button>

          {/* Expanded Desktop Arc View (Screens >= sm) */}
          <div
            className={`hidden sm:block absolute inset-0 pointer-events-none transition-all duration-500 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {AGENTS.map((agent) => {
              const layout = avatarLayouts.find((l) => l.id === agent.id);
              if (!layout) return null;

              return (
                <div
                  key={agent.id}
                  className={`absolute left-1/2 top-1/2 transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                    isExpanded ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                  style={{
                    transform: isExpanded
                      ? `translate(calc(-50% + ${layout.xDesktop}px), calc(-50% + ${layout.yDesktop}px)) rotate(${layout.rotate})`
                      : "translate(-50%, -50%) scale(0.2)",
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  <div className="relative group">
                    <Avatar
                      src={agent.avatar}
                      alt={agent.alt}
                      size={96}
                      float={isExpanded}
                      onClick={() => onSelectAgent(agent.id)}
                      className="cursor-pointer transition-all duration-200 group-hover:scale-110 shadow-md group-hover:shadow-lg"
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-text text-bg text-[11px] font-medium py-1 px-2.5 rounded-sm pointer-events-none whitespace-nowrap shadow-sm">
                      {agent.name} · {agent.domain}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Mobile Grid View (Screens < sm) */}
          <div
            className={`sm:hidden w-full pt-8 flex flex-wrap items-center justify-center gap-4 transition-all duration-400 ${
              isExpanded ? "opacity-100 max-h-[400px] pointer-events-auto" : "opacity-0 max-h-0 pointer-events-none overflow-hidden"
            }`}
          >
            {AGENTS.map((agent, index) => (
              <div
                key={agent.id}
                className="flex flex-col items-center gap-1.5 transition-all duration-300"
                style={{
                  transitionDelay: `${index * 40}ms`,
                  transform: isExpanded ? "scale(1)" : "scale(0.8)",
                }}
              >
                <Avatar
                  src={agent.avatar}
                  alt={agent.alt}
                  size={64 as any}
                  onClick={() => onSelectAgent(agent.id)}
                  className="w-16 h-16 shadow-md"
                />
                <span className="text-xs font-medium text-text">
                  {agent.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
