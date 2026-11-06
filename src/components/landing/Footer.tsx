import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-bg-subtle/30 py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          {/* Brand & Description */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-text">
                AgentHub
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary max-w-sm leading-relaxed">
              A multi-agent AI workspace with specialized domain assistants, real-time citation retrieval, and custom agent infrastructure.
            </p>
          </div>

          {/* Real Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider font-mono">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              <li>
                <a href="#agents" className="hover:text-text transition-colors">
                  Specialist Agents
                </a>
              </li>
              <li>
                <a href="#platform" className="hover:text-text transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#stack" className="hover:text-text transition-colors">
                  Technology Stack
                </a>
              </li>
              <li>
                <Link
                  href="/design-system"
                  className="hover:text-accent transition-colors font-medium text-accent inline-flex items-center gap-1"
                >
                  <span>Design System Preview</span>
                  <span className="text-[10px] bg-accent-tint px-1.5 py-0.2 rounded">
                    Internal
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Theme & Meta */}
          <div className="md:col-span-3 flex flex-col md:items-end justify-between space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Theme</span>
              <ThemeToggle />
            </div>
            <p className="text-[11px] text-text-tertiary font-mono">
              Designed with calm craftsmanship.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
