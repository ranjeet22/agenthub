import React from "react";
import Link from "next/link";
import { Key } from "lucide-react";
import { Button } from "../ui/Button";

export interface HeroSectionProps {
  onOpenLlmModal: () => void;
  onExploreAgents?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenLlmModal,
}) => {
  return (
    <section className="relative pt-20 sm:pt-28 pb-12 sm:pb-16 text-center max-w-[1200px] mx-auto px-5 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Bold Notion-inspired Headline with Instrument Serif Italic */}
        <h1 className="text-4xl sm:text-6xl md:text-[68px] font-semibold text-text tracking-[-0.03em] leading-[1.04] mb-6 sm:mb-8">
          One workspace. Six specialists. Your next{" "}
          <span className="font-serif italic font-normal tracking-normal text-text">
            idea
          </span>
          .
        </h1>

        {/* Short, Confident Supporting Text */}
        <p className="max-w-[56ch] text-base sm:text-xl text-text-secondary font-normal leading-relaxed mb-8 sm:mb-10 text-balance">
          Meet the AI agents that find the information you need, show their sources, and leave room for agents of your own.
        </p>

        {/* Clear, Contrasted CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          <Link href="/agents" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-w-[160px] h-12 text-sm sm:text-base font-medium shadow-sm hover:shadow"
            >
              Try AgentHub
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenLlmModal}
            className="w-full sm:w-auto min-w-[140px] h-12 text-sm sm:text-base font-medium gap-2"
          >
            <Key className="w-4 h-4 text-text-tertiary" />
            <span>LLM API</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

