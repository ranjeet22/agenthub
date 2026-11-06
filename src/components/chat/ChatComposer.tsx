"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Agent } from "@/data/agents";

export interface ChatComposerProps {
  agent: Agent;
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  agent,
  onSendMessage,
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-2.5 sm:px-6 sm:py-4 shrink-0">
      <form
        onSubmit={handleSubmit}
        className="relative bg-surface border border-border rounded-xl shadow-sm focus-within:border-border-strong focus-within:ring-2 transition-all duration-150 p-1.5 sm:p-2.5 flex items-end gap-2"
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${agent.name} anything...`}
          disabled={disabled}
          className="flex-1 max-h-32 sm:max-h-40 bg-transparent resize-none border-none outline-none text-xs sm:text-sm text-text placeholder:text-text-tertiary px-2 py-1.5 leading-relaxed font-sans"
        />

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          aria-label="Send message"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          style={{
            backgroundColor: agent.accent,
          }}
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      <div className="mt-1.5 text-center text-[10px] sm:text-[11px] font-mono text-text-tertiary">
        <span>Live Tools Connected</span>
        <span className="hidden sm:inline">
          {" "}· Press <kbd className="px-1 py-0.5 rounded bg-bg-subtle border border-border text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-bg-subtle border border-border text-[10px]">Shift+Enter</kbd> for newline
        </span>
      </div>
    </div>
  );
};
