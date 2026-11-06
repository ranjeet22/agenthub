import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { AGENTS } from "@/data/agents";
import { AgentSelectionCard } from "@/components/agents/AgentSelectionCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata = {
  title: "Choose your specialist — AgentHub",
  description: "Pick an agent for what you want to explore. Six predefined domain specialists with authentic source grounding.",
};

export default function AgentSelectionPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col selection:bg-accent-tint selection:text-accent">
      {/* Responsive Minimal Header */}
      <header className="w-full h-16 border-b border-border bg-bg/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-text hover:opacity-85 transition-opacity group"
          >
            <span className="font-semibold text-base sm:text-lg tracking-tight text-text">
              AgentHub
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text font-medium transition-colors p-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Back to home</span>
              <span className="inline xs:hidden sm:hidden">Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col">
        {/* Editorial Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 lg:mb-14 px-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-text tracking-[-0.025em] leading-[1.1] mb-2 sm:mb-3">
            Choose your specialist.
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-text-secondary leading-relaxed">
            Pick an agent for what you want to explore.
          </p>
        </div>

        {/* Responsive Grid: exactly 3 cols on PC, changing to 2 cols on smaller screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 w-full items-stretch">
          {AGENTS.map((agent) => (
            <AgentSelectionCard key={agent.id} agent={agent} />
          ))}
        </div>
      </main>

      {/* Responsive Subtle Footer */}
      <footer className="w-full py-5 sm:py-6 border-t border-border text-center text-xs text-text-tertiary font-mono px-4">
        <span>AgentHub · Six specialist agents grounded in authentic sources.</span>
      </footer>
    </div>
  );
}
