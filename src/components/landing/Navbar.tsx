"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, Key } from "lucide-react";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

export interface NavbarProps {
  onOpenLlmModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLlmModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Agents", href: "#agents" },
    { label: "How it works", href: "#platform" },
    { label: "Stack", href: "#stack" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full h-16 transition-all duration-200 bg-bg/85 backdrop-blur-md ${
        isScrolled ? "border-b border-border shadow-sm" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] h-full mx-auto px-5 sm:px-6 flex items-center justify-between gap-4">
        {/* Wordmark + Logo */}
        <Link
          href="/"
          className="flex items-center text-text hover:opacity-85 transition-opacity group focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm"
        >
          <span className="font-semibold text-lg sm:text-xl tracking-tight text-text">
            AgentHub
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-text transition-colors py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenLlmModal}
            className="text-xs h-9 px-3.5 whitespace-nowrap shrink-0"
          >
            <Key className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span className="whitespace-nowrap">LLM API</span>
          </Button>
          <Link href="/agents">
            <Button
              variant="primary"
              size="sm"
              className="text-xs h-9 px-4 font-medium"
            >
              Try AgentHub
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="w-9 h-9 rounded-md flex items-center justify-center text-text hover:bg-bg-subtle border border-border"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-bg/95 backdrop-blur-lg px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-text-secondary">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-text transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLlmModal();
              }}
              className="w-full justify-center gap-2"
            >
              <Key className="w-4 h-4 text-text-tertiary" />
              <span>Configure LLM API</span>
            </Button>
            <Link href="/agents" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
              >
                Try AgentHub
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
