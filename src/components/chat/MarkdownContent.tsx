"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and [links](url) or naked URLs.
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex to split by:
  // 1. **bold**
  // 2. `code`
  // 3. *italic*
  // 4. [text](url)
  // 5. naked URLs (http/https)
  const tokens = text.split(
    /(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*|\[[^\]]+?\]\([^)]+?\)|https?:\/\/[^\s)"]+)/g
  );

  return tokens.map((token, idx) => {
    if (!token) return null;

    // 1. Bold: **text**
    if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
      const inner = token.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-text">
          {renderInline(inner)}
        </strong>
      );
    }

    // 2. Inline Code: `code`
    if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
      const code = token.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-[11px] font-mono text-accent"
        >
          {code}
        </code>
      );
    }

    // 3. Italic: *text* (when not a bullet)
    if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
      const italic = token.slice(1, -1);
      return (
        <em key={idx} className="italic text-text-secondary">
          {renderInline(italic)}
        </em>
      );
    }

    // 4. Markdown Link: [title](url)
    const linkMatch = token.match(/^\[([^\]]+?)\]\(([^)]+?)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline font-medium underline-offset-2 break-all"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 inline-block shrink-0" />
        </a>
      );
    }

    // 5. Naked URL: https://...
    if (token.startsWith("http://") || token.startsWith("https://")) {
      return (
        <a
          key={idx}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline font-medium underline-offset-2 break-all"
        >
          <span className="truncate max-w-xs">{token}</span>
          <ExternalLink className="w-3 h-3 inline-block shrink-0" />
        </a>
      );
    }

    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  if (!content) return null;

  // Split into paragraphs / lines
  const lines = content.split("\n");

  const elements: React.ReactNode[] = [];
  let currentList: { key: number; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      elements.push(
        <ul
          key={`list-${currentList.key}`}
          className="my-2.5 space-y-1.5 pl-2 list-none"
        >
          {currentList.items}
        </ul>
      );
      currentList = null;
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Check if line is a bullet item (e.g. "* ...", "- ...", "• ...")
    const bulletMatch = line.match(/^([*\-•])\s+(.+)$/);
    if (bulletMatch) {
      const itemText = bulletMatch[2];
      if (!currentList) {
        currentList = { key: idx, items: [] };
      }
      currentList.items.push(
        <li key={idx} className="flex items-start gap-2 text-text leading-relaxed">
          <span className="text-text-tertiary select-none text-base leading-tight mt-0.5">•</span>
          <div className="flex-1 min-w-0">{renderInline(itemText)}</div>
        </li>
      );
      return;
    }

    // Not a bullet, flush any pending list
    flushList();

    // Check if line is a header (### or ##)
    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={idx}
          className="text-xs sm:text-sm font-semibold text-text uppercase tracking-wider mt-3 mb-1"
        >
          {renderInline(line.slice(4))}
        </h4>
      );
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={idx}
          className="text-sm sm:text-base font-semibold text-text mt-3.5 mb-1.5"
        >
          {renderInline(line.slice(3))}
        </h3>
      );
      return;
    }

    // Standalone bold title line (e.g. "**By the Dozen: NASA's James Webb Space Telescope Mirrors**")
    if (line.startsWith("**") && line.endsWith("**") && !line.includes(":**")) {
      elements.push(
        <div
          key={idx}
          className="text-sm font-semibold text-text mt-3 mb-1 pt-1 border-t border-border/40 first:border-0 first:pt-0 first:mt-0"
        >
          {renderInline(line.slice(2, -2))}
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={idx} className="text-text leading-relaxed my-1.5">
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-text leading-relaxed text-xs sm:text-sm font-sans">{elements}</div>;
};
