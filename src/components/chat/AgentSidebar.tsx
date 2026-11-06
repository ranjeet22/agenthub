"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Key,
  X,
} from "lucide-react";
import { AGENTS, Agent } from "@/data/agents";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface AgentSidebarProps {
  currentAgent: Agent;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenKeyModal?: () => void;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  currentAgent,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenKeyModal,
}) => {
  const router = useRouter();

  const handleSelectAgent = (agentId: string) => {
    router.push(`/chat/${agentId}`);
    onCloseMobile();
  };

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col bg-surface border-r border-border transition-all duration-200 select-none z-30 ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Top Brand & Collapse Toggle */}
      <div
        className={`h-16 px-3 border-b border-border flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } gap-2`}
      >
        {!isCollapsed && (
          <Link
            href="/"
            className="flex items-center text-text hover:opacity-85 transition-opacity"
            title="AgentHub Home"
          >
            <span className="font-semibold text-base sm:text-lg tracking-tight text-text truncate">
              AgentHub
            </span>
          </Link>
        )}

        {/* Single Unified Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex p-2 rounded-md text-text-secondary hover:text-text hover:bg-bg-subtle transition-colors shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          className="md:hidden p-1.5 rounded-sm text-text-tertiary hover:text-text hover:bg-bg-subtle transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Agent List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
            Specialist Fleet
          </div>
        )}

        {AGENTS.map((agent) => {
          const isActive = agent.id === currentAgent.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => handleSelectAgent(agent.id)}
              aria-label={`Chat with ${agent.name}`}
              aria-current={isActive ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all text-left group relative ${
                isActive
                  ? "bg-bg-subtle text-text shadow-2xs font-medium"
                  : "text-text-secondary hover:text-text hover:bg-bg-subtle/50"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              {/* Active Indicator Strip */}
              {isActive && (
                <div
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                  style={{ backgroundColor: agent.accent }}
                />
              )}

              <Avatar
                src={agent.avatar}
                alt={agent.alt}
                size={28}
                className="shrink-0 transition-transform group-hover:scale-105"
              />

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-text truncate">
                    {agent.name}
                  </div>
                  <div className="text-[11px] text-text-tertiary truncate">
                    {agent.domain}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions: API Key, All Agents Link & Theme Toggle */}
      <div className="p-3 border-t border-border space-y-2">
        {onOpenKeyModal && (
          <button
            type="button"
            onClick={onOpenKeyModal}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-bg-subtle transition-colors text-left ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-4 h-4 text-amber-600 shrink-0" />
            {!isCollapsed && <span>Gemini API Key</span>}
          </button>
        )}

        <Link
          href="/agents"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text hover:bg-bg-subtle transition-colors ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="All Specialists"
        >
          <LayoutGrid className="w-4 h-4 text-text-tertiary shrink-0" />
          {!isCollapsed && <span>All Specialists</span>}
        </Link>

        {!isCollapsed && (
          <div className="pt-2 border-t border-border/70 flex items-center justify-between px-2.5">
            <span className="text-[11px] text-text-tertiary">Theme</span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex animate-in fade-in duration-150"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-surface shadow-xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
