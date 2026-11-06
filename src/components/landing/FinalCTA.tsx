import React from "react";
import Link from "next/link";
import { Key } from "lucide-react";
import { AGENTS } from "@/data/agents";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

export interface FinalCTAProps {
  onOpenLlmModal: () => void;
  onExploreAgents?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onOpenLlmModal,
}) => {
  return (
    <section className="py-24 sm:py-32 max-w-[1200px] mx-auto px-5 sm:px-6 text-center">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Visual Mascot Signature Cluster */}
        <div className="flex items-center justify-center -space-x-2.5 sm:-space-x-3 mb-8">
          {AGENTS.map((agent) => (
            <Avatar
              key={agent.id}
              src={agent.avatar}
              alt={agent.alt}
              size={40}
              className="shadow-sm hover:translate-y-[-2px] transition-transform"
            />
          ))}
        </div>

        {/* Confident, Minimal Headline */}
        <h2 className="text-3xl sm:text-5xl font-semibold text-text tracking-[-0.025em] leading-[1.08] mb-4">
          Find your next{" "}
          <span className="font-serif italic font-normal text-text">answer</span>.
        </h2>

        <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
          Explore the specialist agents in one unified workspace, grounded with live external evidence.
        </p>

        {/* Aligned Primary and Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          <Link href="/agents" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-w-[160px] text-sm sm:text-base font-medium shadow-sm hover:shadow"
            >
              Try AgentHub
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenLlmModal}
            className="w-full sm:w-auto min-w-[140px] text-sm sm:text-base font-medium gap-2"
          >
            <Key className="w-4 h-4 text-text-tertiary" />
            <span>LLM API</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

