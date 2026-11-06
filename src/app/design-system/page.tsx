"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Terminal, Check } from "lucide-react";
import { AGENTS } from "@/data/agents";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card, AgentCard } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { EvidenceCard } from "@/components/ui/EvidenceCard";
import { ToolTrace } from "@/components/ui/ToolTrace";
import { MockWindow } from "@/components/ui/MockWindow";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DesignSystemPage() {
  const [buttonLoading, setButtonLoading] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-5 sm:px-8 max-w-[1200px] mx-auto space-y-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text font-medium mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Landing Page</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            AgentHub Design System
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Component tokens, typography scale, and mascot inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary">Toggle Theme:</span>
          <ThemeToggle />
        </div>
      </div>

      {/* 1. Color Tokens */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-border pb-2">
          1. Color System
        </h2>

        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
            Core Canvas Tokens
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-md border border-border bg-bg">
              <span className="text-xs font-semibold block">--bg</span>
              <span className="text-[11px] font-mono text-text-tertiary">#FBFAF8</span>
            </div>
            <div className="p-3 rounded-md border border-border bg-bg-subtle">
              <span className="text-xs font-semibold block">--bg-subtle</span>
              <span className="text-[11px] font-mono text-text-tertiary">#F6F5F3</span>
            </div>
            <div className="p-3 rounded-md border border-border bg-surface">
              <span className="text-xs font-semibold block">--surface</span>
              <span className="text-[11px] font-mono text-text-tertiary">#FFFFFF</span>
            </div>
            <div className="p-3 rounded-md border border-border bg-accent text-white">
              <span className="text-xs font-semibold block">--accent</span>
              <span className="text-[11px] font-mono opacity-80">#2F6BFF</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
            Agent Accent Ownership (6 Specialists)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-md border border-border bg-surface"
              >
                <div
                  className="w-full h-8 rounded mb-2 flex items-center justify-center text-xs font-semibold text-white shadow-xs"
                  style={{ backgroundColor: agent.accent }}
                >
                  {agent.name}
                </div>
                <div
                  className="w-full h-6 rounded flex items-center justify-center text-[10px] font-mono font-medium"
                  style={{
                    backgroundColor: agent.accentTint,
                    color: agent.accent,
                  }}
                >
                  Tint
                </div>
                <span className="block text-[11px] font-mono text-text-tertiary mt-2">
                  {agent.accent}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Typography Hierarchy */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-border pb-2">
          2. Typography Scale
        </h2>
        <div className="space-y-4 bg-surface p-6 rounded-lg border border-border">
          <div>
            <span className="text-xs font-mono text-text-tertiary">Display Hero (72px / clamp)</span>
            <div className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-tight">
              One workspace. Six specialists. Your next{" "}
              <span className="font-serif italic font-normal">idea</span>.
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <span className="text-xs font-mono text-text-tertiary">H1 Heading (56px / clamp)</span>
            <div className="text-3xl sm:text-5xl font-semibold tracking-[-0.025em]">
              Specialist AI that shows its sources.
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <span className="text-xs font-mono text-text-tertiary">H2 Heading (48px / clamp)</span>
            <div className="text-2xl sm:text-4xl font-semibold tracking-[-0.025em]">
              Your information is everywhere.
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <span className="text-xs font-mono text-text-tertiary">H3 Heading (24px)</span>
            <div className="text-xl font-semibold">
              Orby · Academic Research Specialist
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <span className="text-xs font-mono text-text-tertiary">Body Large (20px) & Body (16px)</span>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
              Meet the AI agents that find the information you need, show their sources, and leave room for agents of your own.
            </p>
          </div>

          <div className="pt-3 border-t border-border">
            <span className="text-xs font-mono text-text-tertiary">Code / Tool Trace (JetBrains Mono 13px)</span>
            <div className="font-mono text-[13px] bg-bg-subtle p-2.5 rounded border border-border">
              pipeline.route(query) =&gt; agent: &quot;orby&quot;, tool: &quot;arxiv_search&quot;, status: 200 OK
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mascot Avatar Fleet */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-border pb-2">
          3. Mascot Avatars (Squircles with Idle Float)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="p-4 bg-surface rounded-lg border border-border flex flex-col items-center gap-3"
            >
              <Avatar
                src={agent.avatar}
                alt={agent.alt}
                size={96}
                float
              />
              <div>
                <span className="text-sm font-semibold block">{agent.name}</span>
                <span className="text-xs text-text-secondary">{agent.domain}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
            Avatar Size Variants & Custom Agent Fallback Tile
          </h3>
          <div className="flex flex-wrap items-end gap-6 p-6 bg-surface rounded-lg border border-border">
            <div className="text-center">
              <Avatar src={AGENTS[0].avatar} alt="Orby" size={96} />
              <span className="block text-[11px] font-mono text-text-tertiary mt-2">96px</span>
            </div>
            <div className="text-center">
              <Avatar src={AGENTS[0].avatar} alt="Orby" size={40} />
              <span className="block text-[11px] font-mono text-text-tertiary mt-2">40px</span>
            </div>
            <div className="text-center">
              <Avatar src={AGENTS[0].avatar} alt="Orby" size={28} />
              <span className="block text-[11px] font-mono text-text-tertiary mt-2">28px</span>
            </div>
            <div className="text-center">
              <Avatar
                alt="Custom Agent"
                fallbackLetter="C"
                tintColor="var(--agent-orby-tint)"
                accentColor="var(--agent-orby)"
                size={40}
              />
              <span className="block text-[11px] font-mono text-text-tertiary mt-2">Custom Fallback</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Component Inventory */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-border pb-2">
          4. Component Primitives
        </h2>

        {/* Buttons */}
        <div className="p-6 bg-surface rounded-lg border border-border space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
            Buttons & States
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="primary" withArrow>
              With Arrow
            </Button>
            <Button
              variant="primary"
              loading={buttonLoading}
              onClick={() => setButtonLoading(!buttonLoading)}
            >
              {buttonLoading ? "Loading..." : "Click to Test Loading"}
            </Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="tertiary" withArrow>
              Tertiary Link
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Chips */}
        <div className="p-6 bg-surface rounded-lg border border-border space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
            Chips & Badges
          </h3>
          <div className="flex flex-wrap gap-2.5">
            <Chip variant="neutral">Neutral Tag</Chip>
            <Chip variant="orby">Orby Academic</Chip>
            <Chip variant="biblio">Biblio Books</Chip>
            <Chip variant="cosmo">Cosmo Space</Chip>
            <Chip variant="atlas">Atlas Entity</Chip>
            <Chip variant="breeze">Breeze Air Quality</Chip>
            <Chip variant="palette">Palette Art</Chip>
            <Chip variant="success">Verified 200 OK</Chip>
          </div>
        </div>

        {/* Evidence Card & Tool Trace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              Evidence Card (Signature Platform Unit)
            </h3>
            <EvidenceCard
              variant="paper"
              title="Direct Air Capture with Solid Sorbents: A Comprehensive Review"
              authors="Chen, L., Wang, Y., & Martinez, R. (2024)"
              source="arXiv:2403.11982 [cond-mat.mtrl-sci]"
              domain="arxiv.org"
              url="https://arxiv.org/abs/2403.11982"
              metadata="Cited by 142 · Open Access"
              agentColor="var(--agent-orby)"
              agentTint="var(--agent-orby-tint)"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              Tool Execution Trace
            </h3>
            <ToolTrace
              tool="arxiv_openalex_query"
              duration="340ms"
              resultCount={8}
              args={{ query: "carbon capture", max_results: 10 }}
              defaultOpen={true}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
