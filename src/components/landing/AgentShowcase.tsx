"use client";

import React, { useState } from "react";
import { Terminal, Sparkles, ExternalLink, ArrowRight, Play } from "lucide-react";
import { AGENTS, Agent } from "@/data/agents";
import { Avatar } from "../ui/Avatar";
import { Chip } from "../ui/Chip";
import { Button } from "../ui/Button";
import { EvidenceCard } from "../ui/EvidenceCard";
import { ToolTrace } from "../ui/ToolTrace";

export interface AgentShowcaseProps {
  selectedAgentId: Agent["id"];
  onSelectAgent: (id: Agent["id"]) => void;
  onOpenLlmModal: () => void;
}

export const AgentShowcase: React.FC<AgentShowcaseProps> = ({
  selectedAgentId,
  onSelectAgent,
  onOpenLlmModal,
}) => {
  const currentAgent = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[0];
  const [showTrace, setShowTrace] = useState(false);

  return (
    <section id="agents" className="py-20 sm:py-28 max-w-[1200px] mx-auto px-5 sm:px-6">
      <div className="mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-bg-subtle border border-border text-text-secondary text-xs font-medium mb-3">
          <span>The Specialist Fleet</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold text-text tracking-[-0.025em] leading-[1.08] mb-3">
          Six specialist agents.
        </h2>
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
          Each agent has dedicated tool bindings, authentic sources, and purpose-built retrieval logic.
        </p>
      </div>

      {/* Accessible 6-Agent Avatar Selector Bar */}
      <div
        role="tablist"
        aria-label="Agent selector"
        className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-bg-subtle border border-border rounded-xl mb-8 overflow-x-auto select-none"
      >
        {AGENTS.map((agent) => {
          const isSelected = agent.id === currentAgent.id;
          return (
            <button
              key={agent.id}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`agent-panel-${agent.id}`}
              onClick={() => {
                onSelectAgent(agent.id);
                setShowTrace(false);
              }}
              className={`flex-1 min-w-[100px] sm:min-w-0 py-2 sm:py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                isSelected
                  ? "bg-surface text-text shadow-sm border border-border"
                  : "text-text-secondary hover:text-text hover:bg-surface/50 border border-transparent"
              }`}
            >
              <Avatar
                src={agent.avatar}
                alt={agent.alt}
                size={28}
                className="shrink-0"
              />
              <span className="font-semibold">{agent.name}</span>
            </button>
          );
        })}
      </div>

      {/* Split-Screen Showcase Workspace */}
      <div
        id={`agent-panel-${currentAgent.id}`}
        role="tabpanel"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-surface border border-border rounded-xl p-6 sm:p-10 shadow-sm relative overflow-hidden transition-all duration-300"
      >
        {/* Distinct 3px Top Accent Stripe for Selected Agent */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] transition-colors duration-300"
          style={{ backgroundColor: currentAgent.accent }}
        />

        {/* Left Side: Large Mascot Visual Presentation */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 bg-bg-subtle/70 rounded-lg border border-border/80 relative">
          <div className="flex items-center justify-center transition-all duration-300 py-4">
            <Avatar
              src={currentAgent.avatar}
              alt={currentAgent.alt}
              size={164}
              float
              className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-md"
            />
          </div>

          <div className="mt-6 text-center">
            <span
              className="inline-block px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: currentAgent.accentTint,
                color: currentAgent.accent,
              }}
            >
              {currentAgent.domain}
            </span>
          </div>
        </div>

        {/* Right Side: Agent Details, Tools, Example Query, and Live Evidence Output */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="text-2xl sm:text-3xl font-semibold text-text">
                {currentAgent.name}
              </h3>
              <Chip variant="neutral" className="text-xs">
                Active Specialist
              </Chip>
            </div>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
              {currentAgent.behavior}
            </p>

            {/* Tools Used */}
            <div className="mb-6">
              <span className="block text-xs font-mono uppercase text-text-tertiary mb-2 tracking-wider">
                Connected Tools & Data Sources
              </span>
              <div className="flex flex-wrap gap-2">
                {currentAgent.tools.map((tool) => (
                  <Chip
                    key={tool}
                    variant={currentAgent.id as any}
                    icon={<Terminal className="w-3 h-3" />}
                  >
                    {tool}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Interactive Example Query Pill */}
            <div className="mb-6">
              <span className="block text-xs font-mono uppercase text-text-tertiary mb-2 tracking-wider">
                Example Query
              </span>
              <div className="p-3 bg-bg-subtle border border-border rounded-md flex items-center justify-between gap-3 text-xs sm:text-sm text-text">
                <span className="font-mono text-text-secondary line-clamp-1">
                  &ldquo;{currentAgent.exampleQuery}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setShowTrace(!showTrace)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface border border-border text-xs font-medium text-text hover:text-accent hover:border-accent transition-colors shrink-0"
                >
                  <Play className="w-3 h-3 text-accent" />
                  <span>{showTrace ? "Hide Trace" : "View Trace"}</span>
                </button>
              </div>
            </div>

            {/* Monospace Execution Trace Drawer */}
            {showTrace && (
              <div className="mb-6 animate-in fade-in duration-150">
                <ToolTrace
                  tool={currentAgent.tracePreview.tool}
                  duration={currentAgent.tracePreview.duration}
                  resultCount={currentAgent.tracePreview.resultCount}
                  args={currentAgent.tracePreview.args}
                  defaultOpen={true}
                />
              </div>
            )}

            {/* Structured Evidence Card Output */}
            <div>
              <span className="block text-xs font-mono uppercase text-text-tertiary mb-2 tracking-wider">
                Retrieved Source Evidence
              </span>
              <EvidenceCard
                variant={currentAgent.evidenceVariant}
                title={currentAgent.evidence.title}
                authors={currentAgent.evidence.authors}
                source={currentAgent.evidence.source}
                domain={currentAgent.evidence.domain}
                url={currentAgent.evidence.url}
                metadata={currentAgent.evidence.metadata}
                agentColor={currentAgent.accent}
                agentTint={currentAgent.accentTint}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-text-tertiary font-mono">
              Tool execution: verified real-time source retrieval
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenLlmModal}
              className="text-xs h-9"
            >
              Test with Gemini key
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
