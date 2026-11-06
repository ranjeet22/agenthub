"use client";

import React from "react";
import { User, KeyRound, AlertTriangle, Sparkles } from "lucide-react";
import { Agent } from "@/data/agents";
import { Avatar } from "@/components/ui/Avatar";
import { NasaGallery, NasaItem } from "./NasaGallery";
import { BookCoverCard, BookItem } from "./BookCoverCard";
import { ArtworkCard } from "./ArtworkCard";
import { EvidenceCard } from "./EvidenceCard";
import { MarkdownContent } from "./MarkdownContent";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  isPlaceholder?: boolean;
  tool?: string;
  evidence?: any;
  follow_ups?: string[];
  error_type?: "missing_key" | "quota_exceeded" | "invalid_key" | "generic_error" | "service_error";
  error_message?: string;
}

export interface ChatMessageItemProps {
  message: ChatMessage;
  agent: Agent;
  onFollowUpClick?: (question: string) => void;
  onOpenKeyModal?: () => void;
}

/**
 * Fallback parser to extract NASA image captures if returned in markdown text
 */
function extractNasaImagesFromText(text: string): NasaItem[] {
  const images: NasaItem[] = [];
  const imageRegex = /https?:\/\/[^\s\)\*]+?(?:~thumb\.jpg|\.jpg|\.png|\.jpeg|\.webp)/gi;
  const matches = text.match(imageRegex);

  if (!matches || matches.length === 0) return [];

  // Group text by image occurrences
  const lines = text.split("\n");
  let currentTitle = "NASA Space Observation";
  let currentDesc = "";
  let currentDate = "";
  let currentSource = "";

  for (const line of lines) {
    const boldTitleMatch = line.match(/^\*\*([^*]+?)\*\*$/);
    if (boldTitleMatch && !boldTitleMatch[1].includes(":")) {
      currentTitle = boldTitleMatch[1].trim();
    }
    const dateMatch = line.match(/\*\*Date Created:\*\*\s*([^\n*]+)/i);
    if (dateMatch) currentDate = dateMatch[1].trim();

    const descMatch = line.match(/\*\*Explanation:\*\*\s*([^\n*]+)/i);
    if (descMatch) currentDesc = descMatch[1].trim();

    const sourceMatch = line.match(/\*\*NASA Source Page:\*\*\s*(https?:\/\/[^\s\)]+)/i);
    if (sourceMatch) currentSource = sourceMatch[1].trim();

    const urlMatch = line.match(imageRegex);
    if (urlMatch && urlMatch[0]) {
      // Avoid duplicate images
      if (!images.some((img) => img.image_url === urlMatch[0])) {
        images.push({
          title: currentTitle,
          image_url: urlMatch[0],
          description: currentDesc,
          date_created: currentDate,
          source_url: currentSource,
        });
      }
    }
  }

  return images;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  agent,
  onFollowUpClick,
  onOpenKeyModal,
}) => {
  const isUser = message.sender === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 sm:gap-3 max-w-[90%] sm:max-w-2xl ml-auto animate-in fade-in duration-150">
        <div className="space-y-1 text-right min-w-0">
          <div
            className="inline-block text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tr-xs text-xs sm:text-sm leading-relaxed shadow-2xs text-left break-words"
            style={{ backgroundColor: agent.accent }}
          >
            {message.text}
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-text-tertiary pr-1">
            {message.timestamp}
          </div>
        </div>

        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-text-secondary shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
    );
  }

  // Handle dedicated friendly error cards
  const isError = Boolean(message.error_type);

  // Extract structured visual evidence
  const evidence = message.evidence;
  let nasaImages: NasaItem[] = [];
  let books: BookItem[] = [];
  let artworks: any[] = [];
  let generalEvidence: any = null;

  if (evidence) {
    const list = Array.isArray(evidence) ? evidence : [evidence];
    for (const item of list) {
      if (item?.images && Array.isArray(item.images)) {
        nasaImages = [...nasaImages, ...item.images];
      } else if (item?.image_url && item?.title) {
        nasaImages.push(item);
      }

      if (item?.books && Array.isArray(item.books)) {
        books = [...books, ...item.books];
      } else if (item?.title && (item?.cover_url || item?.cover_image_url || item?.cover_id || item?.cover_i || item?.isbn || item?.authors || item?.author_name)) {
        books.push(item);
      }

      if (item?.artworks && Array.isArray(item.artworks)) {
        artworks = [...artworks, ...item.artworks];
      } else if (item?.title && (item?.primary_image || item?.object_id)) {
        artworks.push(item);
      }
    }

    if (nasaImages.length === 0 && books.length === 0 && artworks.length === 0) {
      generalEvidence = evidence;
    }
  }

  // Fallback: If agent is Cosmo and images array is empty, extract from markdown text
  if (nasaImages.length === 0 && (agent.id === "cosmo" || (agent.id as string) === "space")) {
    nasaImages = extractNasaImagesFromText(message.text);
  }

  return (
    <div className="flex items-start gap-2.5 sm:gap-3 max-w-[95%] sm:max-w-3xl mr-auto animate-in fade-in duration-150">
      <Avatar
        src={agent.avatar}
        alt={agent.alt}
        size={40}
        className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 mt-0.5 drop-shadow-sm"
      />

      <div className="space-y-2 flex-1 min-w-0">
        {/* Header line */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs font-semibold text-text">{agent.name}</span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs"
            style={{
              backgroundColor: agent.accentTint,
              color: agent.accent,
            }}
          >
            {agent.domain}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-text-tertiary">
            {message.timestamp}
          </span>
        </div>

        {/* Missing Key Guard Card */}
        {message.error_type === "missing_key" && (
          <div className="bg-surface border border-amber-500/50 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-text">
                  Google Gemini API Key Required
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  To converse with {agent.name} and query live domain tools, please provide your free Google Gemini API key. Your key is stored securely in your browser and is never saved to a database.
                </p>
              </div>
            </div>
            {onOpenKeyModal && (
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={onOpenKeyModal}
                  className="px-3.5 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-2xs cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: agent.accent }}
                >
                  Configure API Key
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-secondary hover:text-text underline underline-offset-2 ml-2"
                >
                  Get free key at Google AI Studio &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {/* Quota Exceeded Card */}
        {message.error_type === "quota_exceeded" && (
          <div className="bg-surface border border-amber-500/60 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-text">
                  Gemini API Quota Exceeded
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your Google Gemini API free rate limit has been temporarily reached. Google limits free-tier requests per minute. Please wait 30 seconds before retrying, or configure an alternate API key.
                </p>
              </div>
            </div>
            {onOpenKeyModal && (
              <div className="pt-1">
                <button
                  onClick={onOpenKeyModal}
                  className="px-3.5 py-1.5 text-xs font-medium text-text bg-bg-subtle hover:bg-surface border border-border rounded-lg transition-colors cursor-pointer"
                >
                  Update or Test API Key
                </button>
              </div>
            )}
          </div>
        )}

        {/* Invalid Key Card */}
        {message.error_type === "invalid_key" && (
          <div className="bg-surface border border-rose-500/50 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-text">
                  Invalid Gemini API Key
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  The API key was rejected by Google Gemini. Please ensure that quotation marks, brackets, and extra spaces were removed, or generate a fresh key in Google AI Studio.
                </p>
              </div>
            </div>
            {onOpenKeyModal && (
              <div className="pt-1">
                <button
                  onClick={onOpenKeyModal}
                  className="px-3.5 py-1.5 text-xs font-medium text-text bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  Change API Key
                </button>
              </div>
            )}
          </div>
        )}

        {/* Generic Error Card */}
        {(message.error_type === "generic_error" || message.error_type === "service_error") && (
          <div className="bg-surface border border-border rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-2">
            <p className="text-xs sm:text-sm text-text leading-relaxed">
              {message.text || "I was unable to complete your request at this time. Please try rephrasing or asking again."}
            </p>
          </div>
        )}

        {/* Standard Message Content with Full Markdown Formatting */}
        {!isError && (
          <div className="bg-surface border border-border rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-xs sm:text-sm text-text leading-relaxed shadow-2xs space-y-3 break-words">
            <MarkdownContent content={message.text} />

            {/* Evidence: NASA Multi-Image Gallery */}
            {nasaImages.length > 0 && <NasaGallery items={nasaImages} />}

            {/* Evidence: Open Library Book Covers */}
            {books.length > 0 && <BookCoverCard books={books} />}

            {/* Evidence: Met Museum Artworks */}
            {artworks.length > 0 && <ArtworkCard artworks={artworks} />}

            {/* Evidence: ArXiv, Air Quality, Wikidata, etc. */}
            {generalEvidence && (
              <EvidenceCard tool={message.tool} evidence={generalEvidence} />
            )}
          </div>
        )}

        {/* Contextual Follow-Up Suggestions */}
        {message.follow_ups && message.follow_ups.length > 0 && onFollowUpClick && (
          <div className="pt-1.5 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-text-tertiary">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Suggested follow-ups:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.follow_ups.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUpClick(suggestion)}
                  className="px-2.5 py-1 text-[11px] sm:text-xs text-text bg-surface hover:bg-bg-subtle border border-border hover:border-border-strong rounded-full text-left transition-colors shadow-2xs cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
