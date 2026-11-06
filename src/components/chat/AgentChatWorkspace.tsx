"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Agent } from "@/data/agents";
import { AgentSidebar } from "./AgentSidebar";
import { AgentHeader } from "./AgentHeader";
import { WelcomeState } from "./WelcomeState";
import { ChatMessageItem, ChatMessage } from "./ChatMessageItem";
import { ChatComposer } from "./ChatComposer";
import { LlmApiModal } from "@/components/ui/LlmApiModal";
import { Loader2 } from "lucide-react";

export interface AgentChatWorkspaceProps {
  agent: Agent;
}

export const AgentChatWorkspace: React.FC<AgentChatWorkspaceProps> = ({ agent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // 1. Load isolated conversation memory for this specific agent from localStorage
  useEffect(() => {
    try {
      const storageKey = `agenthub_chat_${agent.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to load chat history for agent", agent.id, err);
    }
    setMessages([]);
  }, [agent.id]);

  // 2. Persist conversation updates to this agent's separate localStorage key
  const saveMessages = useCallback(
    (newMessages: ChatMessage[]) => {
      setMessages(newMessages);
      try {
        const storageKey = `agenthub_chat_${agent.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newMessages));
      } catch (err) {
        console.warn("Failed to persist chat history for agent", agent.id, err);
      }
    },
    [agent.id]
  );

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clear chat history for the currently active agent only
  const handleClearChat = () => {
    if (confirm(`Clear chat history with ${agent.name}?`)) {
      try {
        localStorage.removeItem(`agenthub_chat_${agent.id}`);
      } catch (e) {}
      setMessages([]);
    }
  };

  // Helper to get sanitized API key from localStorage
  const getStoredApiKey = (): string => {
    try {
      const raw = localStorage.getItem("agenthub_gemini_api_key") || "";
      let clean = raw.trim();
      if (
        (clean.startsWith('"') && clean.endsWith('"')) ||
        (clean.startsWith("'") && clean.endsWith("'"))
      ) {
        clean = clean.slice(1, -1).trim();
      }
      return clean;
    } catch (e) {
      return "";
    }
  };

  const getAgentThinkingText = (agentId: string): string => {
    switch (agentId) {
      case "cosmo":
        return "Cosmo is searching NASA image database & telemetry...";
      case "biblio":
        return "Biblio is querying Open Library catalogues & book covers...";
      case "palette":
        return "Palette is searching The Met Museum of Art collection...";
      case "orby":
        return "Orby is querying arXiv scientific research papers...";
      case "atlas":
        return "Atlas is exploring Wikidata knowledge graph entities...";
      case "breeze":
        return "Breeze is retrieving real-time air quality index & sensors...";
      default:
        return `${agent.name} is thinking & retrieving evidence...`;
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: timeString,
    };

    const nextMessages = [...messages, userMessage];
    saveMessages(nextMessages);

    // Guard: Check if user has entered an API key
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      const missingKeyMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: `Hello! I am ${agent.name}. To query live tools and answer your question, please configure your Google Gemini API key.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        error_type: "missing_key",
      };
      saveMessages([...nextMessages, missingKeyMessage]);
      return;
    }

    // Set loading state with agent-specific prompt
    setIsLoading(true);
    setLoadingText(getAgentThinkingText(agent.id));

    try {
      // Build lightweight conversation history for LangChain context
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [m.text],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          agent_id: agent.id,
          api_key: apiKey,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const responseTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (data.error_type) {
        const errorMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          text: data.answer || data.response || data.error_message || "An issue occurred while processing your request.",
          timestamp: responseTime,
          error_type: data.error_type,
          error_message: data.error_message,
        };
        saveMessages([...nextMessages, errorMsg]);
      } else {
        const rawTool = data.tool_calls?.[0] || data.evidence?.[0]?.tool || data.tool;
        const toolName = typeof rawTool === "string" ? rawTool : (rawTool && typeof rawTool === "object" && "name" in rawTool ? String((rawTool as any).name) : undefined);

        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          text: data.answer || data.response || "No response received.",
          timestamp: responseTime,
          tool: toolName,
          evidence: data.evidence,
          follow_ups: data.follow_ups,
        };
        saveMessages([...nextMessages, agentMessage]);
      }
    } catch (err: any) {
      console.error("Agent chat execution error:", err);
      const errorMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: "I was unable to complete your request due to a network connection issue. Please make sure the backend service is running and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        error_type: "generic_error",
      };
      saveMessages([...nextMessages, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-bg text-text selection:bg-accent-tint selection:text-accent">
      {/* 1. Collapsible Sidebar */}
      <AgentSidebar
        currentAgent={agent}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg">
        {/* Agent Information Header */}
        <AgentHeader
          agent={agent}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onClearChat={messages.length > 0 ? handleClearChat : undefined}
        />

        {/* Conversation Workspace Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col">
          {messages.length === 0 ? (
            <WelcomeState
              agent={agent}
              onSelectPrompt={handleSendMessage}
            />
          ) : (
            <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-5 my-auto">
              {messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  agent={agent}
                  onFollowUpClick={handleSendMessage}
                  onOpenKeyModal={() => setIsKeyModalOpen(true)}
                />
              ))}

              {/* Dynamic Agent Thinking Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border/80 text-xs text-text-secondary animate-pulse max-w-md">
                  <Loader2
                    className="w-4 h-4 animate-spin shrink-0"
                    style={{ color: agent.accent }}
                  />
                  <span>{loadingText}</span>
                </div>
              )}

              <div ref={conversationEndRef} />
            </div>
          )}
        </div>

        {/* Message Composer (Anchored at bottom) */}
        <ChatComposer
          agent={agent}
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>

      {/* Global API Key Configuration Modal */}
      <LlmApiModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </div>
  );
};
