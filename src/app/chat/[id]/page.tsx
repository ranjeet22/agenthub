import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENTS, getAgentById } from "@/data/agents";
import { AgentChatWorkspace } from "@/components/chat/AgentChatWorkspace";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return AGENTS.map((agent) => ({
    id: agent.id,
  }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const agent = getAgentById(params.id);
  if (!agent) {
    return {
      title: "Agent Not Found — AgentHub",
    };
  }
  return {
    title: `${agent.name} (${agent.domain}) — AgentHub`,
    description: agent.behavior,
  };
}

export default function AgentChatPage({
  params,
}: {
  params: { id: string };
}) {
  const agent = getAgentById(params.id);

  if (!agent) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-semibold mb-3">Agent Not Found</h1>
        <p className="text-sm text-text-secondary mb-6 max-w-sm">
          The requested agent does not exist. Please select one of our six active specialists.
        </p>
        <Link href="/agents">
          <Button variant="primary" withArrow>
            View All Specialists
          </Button>
        </Link>
      </div>
    );
  }

  return <AgentChatWorkspace agent={agent} />;
}
