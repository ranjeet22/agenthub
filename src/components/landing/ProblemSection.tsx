import React from "react";
import { FileText, BookOpen, Telescope, Database, Wind, Landmark, ArrowUpRight } from "lucide-react";

export const ProblemSection: React.FC = () => {
  const fragmentedSources = [
    {
      icon: <FileText className="w-4 h-4 text-agent-orby" />,
      title: "arXiv & OpenAlex",
      detail: "Preprint repositories and citation graphs",
      status: "Separate database",
    },
    {
      icon: <BookOpen className="w-4 h-4 text-agent-biblio" />,
      title: "Open Library",
      detail: "Editions, ISBNs, and library records",
      status: "Catalog search",
    },
    {
      icon: <Telescope className="w-4 h-4 text-agent-cosmo" />,
      title: "NASA Imagery",
      detail: "Deep space missions and telemetry",
      status: "Mission archive",
    },
    {
      icon: <Database className="w-4 h-4 text-agent-atlas" />,
      title: "Wikidata",
      detail: "Entity relationships and claims",
      status: "Knowledge graph",
    },
    {
      icon: <Wind className="w-4 h-4 text-agent-breeze" />,
      title: "OpenAQ Stations",
      detail: "Ground-level particulate sensors",
      status: "Real-time feed",
    },
    {
      icon: <Landmark className="w-4 h-4 text-agent-palette" />,
      title: "The Met Museum",
      detail: "Curated collection archives",
      status: "Museum catalog",
    },
  ];

  return (
    <section className="py-20 sm:py-28 max-w-[1200px] mx-auto px-5 sm:px-6">
      <div className="max-w-2xl mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl font-semibold text-text tracking-[-0.025em] leading-[1.08] mb-4">
          Your information is everywhere.
        </h2>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
          Different questions demand specialized data sources, separate search syntax, and manual verification. General-purpose chat models can&apos;t reliably bridge the gap alone.
        </p>
      </div>

      {/* Editorial Fragmented Sources Grid */}
      <div className="relative p-6 sm:p-10 rounded-xl border border-dashed border-border-strong bg-bg-subtle/50 overflow-hidden">
        {/* Disconnected Context Flow Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {fragmentedSources.map((source, index) => (
            <div
              key={source.title}
              className="bg-surface border border-border rounded-md p-4 transition-all duration-150 hover:border-border-strong shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-sm bg-bg-subtle border border-border flex items-center justify-center">
                  {source.icon}
                </div>
                <span className="text-[11px] font-mono text-text-tertiary px-2 py-0.5 rounded bg-bg-subtle border border-border/70">
                  {source.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-text mb-1 flex items-center gap-1">
                <span>{source.title}</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {source.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Editorial Footnote Note */}
        <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-tertiary font-mono">
          <span>Fragmented workflows require constant tab switching and manual corroboration.</span>
          <span className="shrink-0 text-text-secondary font-medium">Context switching cost: High</span>
        </div>
      </div>
    </section>
  );
};
