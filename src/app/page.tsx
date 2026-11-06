"use client";

import React, { useState } from "react";
import { AGENTS, Agent } from "@/data/agents";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AgentConstellation } from "@/components/landing/AgentConstellation";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { AgentShowcase } from "@/components/landing/AgentShowcase";
import { TechStackMarquee } from "@/components/landing/TechStackMarquee";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { LlmApiModal } from "@/components/ui/LlmApiModal";

export default function LandingPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<Agent["id"]>("orby");
  const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);

  const handleSelectAgent = (agentId: Agent["id"]) => {
    setSelectedAgentId(agentId);
    const element = document.getElementById("agents");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToAgents = () => {
    const element = document.getElementById("agents");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-accent-tint selection:text-accent">
      {/* 1. Navbar */}
      <Navbar onOpenLlmModal={() => setIsLlmModalOpen(true)} />

      {/* Main Narrative Flow */}
      <main className="flex-1">
        {/* 2. Minimal Hero */}
        <HeroSection
          onOpenLlmModal={() => setIsLlmModalOpen(true)}
          onExploreAgents={handleScrollToAgents}
        />

        {/* 3. Interactive Agent Constellation */}
        <AgentConstellation onSelectAgent={handleSelectAgent} />

        {/* 4. The Problem */}
        <ProblemSection />

        {/* 5. Introducing AgentHub */}
        <PlatformSection onExploreAgents={handleScrollToAgents} />

        {/* 6. Specialist Agents */}
        <AgentShowcase
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
          onOpenLlmModal={() => setIsLlmModalOpen(true)}
        />

        {/* 7. Technology Stack Marquee */}
        <TechStackMarquee />

        {/* 8. Try AgentHub Call to Action */}
        <FinalCTA
          onOpenLlmModal={() => setIsLlmModalOpen(true)}
          onExploreAgents={handleScrollToAgents}
        />
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* Reusable LLM API Configuration Modal */}
      <LlmApiModal
        isOpen={isLlmModalOpen}
        onClose={() => setIsLlmModalOpen(false)}
      />
    </div>
  );
}
