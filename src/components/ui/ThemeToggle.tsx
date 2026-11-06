"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const active = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (active) {
      setTheme(active);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("agenthub-theme", next);
    } catch (e) {}
  };

  if (!mounted) {
    return <div className={`w-9 h-9 rounded-pill border border-border ${className}`} />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-pill border border-border bg-surface text-text hover:bg-bg-subtle hover:border-border-strong transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-text-secondary hover:text-text transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-text-secondary hover:text-text transition-colors" />
      )}
    </button>
  );
};
