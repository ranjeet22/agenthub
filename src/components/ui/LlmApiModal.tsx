"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "./Button";
import { Chip } from "./Chip";

export interface LlmApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (key: string) => void;
}

export const LlmApiModal: React.FC<LlmApiModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<
    "idle" | "testing" | "valid" | "invalid" | "quota_exceeded" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      try {
        const existing = localStorage.getItem("agenthub_gemini_api_key");
        if (existing) {
          setApiKey(existing);
          setStatus("valid");
          setStatusMessage("Saved and active.");
        } else {
          setStatus("idle");
          setStatusMessage("");
        }
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sanitizeKey = (raw: string): string => {
    let clean = raw.trim();
    if (
      (clean.startsWith('"') && clean.endsWith('"')) ||
      (clean.startsWith("'") && clean.endsWith("'"))
    ) {
      clean = clean.slice(1, -1).trim();
    }
    return clean;
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeKey(apiKey);
    if (!clean) {
      setStatus("invalid");
      setStatusMessage("Please enter an API key.");
      return;
    }

    setStatus("testing");
    setStatusMessage("Verifying key with Google Gemini...");

    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: clean }),
      });

      const data = await res.json();

      if (data.valid) {
        setStatus("valid");
        setStatusMessage("API key verified and active.");
        localStorage.setItem("agenthub_gemini_api_key", clean);
        if (onKeySaved) onKeySaved(clean);
        setTimeout(() => {
          onClose();
        }, 800);
      } else if (data.status === "quota_exceeded") {
        setStatus("quota_exceeded");
        setStatusMessage(
          "Key is valid, but your Google AI Studio quota has been exceeded."
        );
        // Save anyway so user doesn't lose it
        localStorage.setItem("agenthub_gemini_api_key", clean);
      } else {
        setStatus("invalid");
        setStatusMessage(
          data.message || "Invalid API key. Please check your Google AI Studio key."
        );
      }
    } catch (err) {
      setStatus("error");
      setStatusMessage("Network error while validating key. Please retry.");
    }
  };

  const handleClear = () => {
    try {
      localStorage.removeItem("agenthub_gemini_api_key");
      setApiKey("");
      setStatus("idle");
      setStatusMessage("");
    } catch (e) {}
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="llm-api-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-surface border border-border rounded-xl shadow-lg p-5 sm:p-6 overflow-hidden transition-all text-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-accent-tint text-accent flex items-center justify-center shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="llm-api-modal-title"
                className="text-base font-semibold text-text"
              >
                LLM API Configuration
              </h3>
              <p className="text-xs text-text-secondary">
                Bring Your Own Key (BYOK)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-sm text-text-tertiary hover:text-text hover:bg-bg-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Context */}
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          AgentHub coordinates specialized tools via Google Gemini. Your key is stored
          only in your local browser and sent exclusively to verify agent calls.
        </p>

        {/* Active Provider Tag */}
        <div className="mb-4 p-3 bg-bg-subtle border border-border rounded-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text">Engine:</span>
            <Chip variant="orby" className="text-[11px] h-6">
              Google Gemini 2.5 Flash
            </Chip>
          </div>
          <span className="text-[11px] text-text-tertiary">Active Provider</span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label
              htmlFor="gemini-key-input"
              className="block text-xs font-medium text-text mb-1.5"
            >
              Google Gemini API Key
            </label>
            <input
              id="gemini-key-input"
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setStatus("idle");
                setStatusMessage("");
              }}
              placeholder='Paste key here (quotes " " are auto-removed)...'
              className="w-full h-11 px-3.5 bg-surface border border-border rounded-md text-sm text-text font-mono placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent-tint focus:outline-none transition-all"
            />
          </div>

          {/* Real-time Status Feedback Badge */}
          {status !== "idle" && (
            <div
              className={`p-2.5 rounded-md text-xs flex items-start gap-2 font-mono ${
                status === "valid"
                  ? "bg-status-success-tint text-status-success border border-status-success/30"
                  : status === "quota_exceeded"
                  ? "bg-status-warning-tint text-status-warning border border-status-warning/30"
                  : status === "testing"
                  ? "bg-bg-subtle text-text-secondary border border-border"
                  : "bg-status-error-tint text-status-error border border-status-error/30"
              }`}
            >
              {status === "testing" && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
              )}
              {status === "valid" && (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-status-success" />
              )}
              {status === "quota_exceeded" && (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-status-warning" />
              )}
              {(status === "invalid" || status === "error") && (
                <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-status-error" />
              )}
              <span className="flex-1 leading-snug">{statusMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-text-tertiary">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-accent transition-colors underline underline-offset-2"
            >
              Get a free key from Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border">
            {apiKey && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClear}
                className="text-xs"
              >
                Clear
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!apiKey.trim() || status === "testing"}
              className="text-xs min-w-[100px]"
            >
              {status === "testing" ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </span>
              ) : status === "valid" ? (
                "Verified & Saved"
              ) : (
                "Verify & Save Key"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
