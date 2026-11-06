import React from "react";
import { TECH_ROW_1, TECH_ROW_2 } from "@/data/tech-stack";
import { Layers } from "lucide-react";

export const TechStackMarquee: React.FC = () => {
  // We duplicate the items 3 times to guarantee continuous seamless looping without gaps
  const row1Items = [...TECH_ROW_1, ...TECH_ROW_1, ...TECH_ROW_1];
  const row2Items = [...TECH_ROW_2, ...TECH_ROW_2, ...TECH_ROW_2];

  return (
    <section
      id="stack"
      className="py-20 sm:py-24 border-y border-border bg-bg-subtle/40 overflow-hidden relative"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface border border-border text-text-secondary text-xs font-medium mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>Integrations & Foundations</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold text-text tracking-[-0.02em]">
          Powered by open protocols and primary archives.
        </h2>
      </div>

      {/* Gradient Fade Masks on Left & Right */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

        {/* Row 1: Right to Left */}
        <div className="flex w-max gap-4 py-2 hover:[animation-play-state:paused] animate-marquee-left select-none">
          {row1Items.map((item, idx) => (
            <div
              key={`row1-${item.name}-${idx}`}
              className="h-11 px-5 rounded-md bg-surface border border-border flex items-center gap-3 text-xs sm:text-sm font-medium text-text hover:border-border-strong transition-colors shrink-0 shadow-sm"
            >
              <span className="font-semibold">{item.name}</span>
              <span className="text-[10px] font-mono uppercase text-text-tertiary bg-bg-subtle px-1.5 py-0.5 rounded border border-border/60">
                {item.category}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2: Left to Right */}
        <div className="flex w-max gap-4 py-2 mt-3 hover:[animation-play-state:paused] animate-marquee-right select-none">
          {row2Items.map((item, idx) => (
            <div
              key={`row2-${item.name}-${idx}`}
              className="h-11 px-5 rounded-md bg-surface border border-border flex items-center gap-3 text-xs sm:text-sm font-medium text-text hover:border-border-strong transition-colors shrink-0 shadow-sm"
            >
              <span className="font-semibold">{item.name}</span>
              <span className="text-[10px] font-mono uppercase text-text-tertiary bg-bg-subtle px-1.5 py-0.5 rounded border border-border/60">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
