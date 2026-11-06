"use client";

import React from "react";
import { ArrowRight, Bot, ShieldCheck, Sparkles, Layers, PlusCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { MockWindow } from "../ui/MockWindow";
import { Avatar } from "../ui/Avatar";
import { EvidenceCard } from "../ui/EvidenceCard";
import { ToolTrace } from "../ui/ToolTrace";
import { AGENTS } from "@/data/agents";

export interface PlatformSectionProps {
  onExploreAgents: () => void;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({
  onExploreAgents,
}) => {
  const orby = AGENTS.find((a) => a.id === "orby")!;

  return (
    <section id="platform" className="py-20 sm:py-28 max-w-[1200px] mx-auto px-5 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Narrative Copy */}
        <div className="lg:col-span-5 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-accent-tint text-accent text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Platform</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold text-text tracking-[-0.025em] leading-[1.08] mb-6">
            Six specialists to start.{" "}
            <span className="font-serif italic font-normal text-text">Room for your own</span>.
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-6">
            Different questions deserve different specialists. Instead of guessing prompts, AgentHub analyzes your intent, activates domain tools, and preserves verifiable evidence.
          </p>

          <div className="space-y-4 mb-8 w-full">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-sm bg-bg-subtle border border-border flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-text" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text">Domain-Specific Grounding</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Agents don&apos;t hallucinate citations. They connect directly to primary APIs like arXiv, NASA, and The Met.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-sm bg-bg-subtle border border-border flex items-center justify-center shrink-0 mt-0.5">
                <PlusCircle className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text">Custom Agent Builder</h4>
                  <span className="text-[10px] font-mono uppercase bg-bg-subtle border border-border px-1.5 py-0.5 rounded text-text-tertiary">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Connect your proprietary tools, private documents, or internal APIs into custom agents.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onExploreAgents}
            withArrow
          >
            Explore all 6 agents
          </Button>
        </div>

        {/* Right Column: Realistic HTML/CSS Mockup */}
        <div className="lg:col-span-7">
          <MockWindow
            address="agenthub.local/pipeline · router: orby [academic]"
            className="w-full"
          >
            {/* User Query Simulation */}
            <div className="space-y-4">
              <div className="flex items-start justify-end gap-2.5">
                <div className="bg-bg-subtle border border-border rounded-md px-3.5 py-2 text-xs sm:text-sm text-text max-w-sm">
                  Find recent research papers on carbon capture optimization.
                </div>
              </div>

              {/* Agent Routing & Response */}
              <div className="flex items-start gap-3">
                <Avatar
                  src={orby.avatar}
                  alt={orby.alt}
                  size={40}
                  className="mt-0.5"
                />
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text">{orby.name}</span>
                    <span className="text-[11px] font-mono text-agent-orby bg-agent-orby-tint px-2 py-0.5 rounded">
                      {orby.domain}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-text leading-relaxed">
                    Identified recent publications analyzing solid sorbent efficiency under ambient humidity conditions:
                  </p>

                  {/* Tool Call Trace */}
                  <ToolTrace
                    tool="search_arxiv_and_openalex"
                    duration="340ms"
                    resultCount={8}
                    args={{ query: "carbon capture optimization", min_citations: 20 }}
                    defaultOpen={false}
                  />

                  {/* Evidence Card */}
                  <EvidenceCard
                    variant="paper"
                    title={orby.evidence.title}
                    authors={orby.evidence.authors}
                    source={orby.evidence.source}
                    domain={orby.evidence.domain}
                    url={orby.evidence.url}
                    metadata={orby.evidence.metadata}
                    agentColor={orby.accent}
                    agentTint={orby.accentTint}
                  />
                </div>
              </div>
            </div>
          </MockWindow>
        </div>
      </div>
    </section>
  );
};
