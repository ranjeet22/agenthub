"use client";

import React, { useState } from "react";
import { FileText, Wind, Database, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface EvidenceCardProps {
  tool?: any;
  evidence: any;
}

export function EvidenceCard({ tool, evidence }: EvidenceCardProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  if (!evidence) return null;

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Safely extract string tool name
  const toolName = (
    typeof tool === "string"
      ? tool
      : tool && typeof tool === "object" && "name" in tool
      ? String((tool as any).name)
      : ""
  ).toLowerCase();

  // Safely unpack evidence list or object
  const list = Array.isArray(evidence) ? evidence : [evidence];

  // 1. Check for Academic Research Papers (arXiv, OpenAlex, etc.)
  let papers: any[] = [];
  for (const item of list) {
    if (item?.papers && Array.isArray(item.papers)) {
      papers = [...papers, ...item.papers];
    } else if (item?.title && (item?.authors || item?.pdf_url || item?.abstract || item?.summary || item?.arxiv_id)) {
      papers.push(item);
    }
  }

  const isResearch =
    papers.length > 0 ||
    toolName.includes("arxiv") ||
    toolName.includes("research") ||
    toolName.includes("openalex") ||
    toolName.includes("paper");

  if (isResearch && papers.length > 0) {
    const displayPapers = papers;
    return (
      <div className="mt-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-tertiary uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-accent" />
          <span>Research Papers ({displayPapers.length})</span>
        </div>
        <div className="space-y-2">
          {displayPapers.map((paper: any, idx: number) => {
            const pdfUrl = paper.pdf_url || paper.url || paper.source_url;
            const summary = paper.summary || paper.abstract;
            const authors = Array.isArray(paper.authors)
              ? paper.authors.join(", ")
              : paper.authors || paper.author;

            return (
              <div
                key={idx}
                className="p-3 bg-bg-subtle/80 border border-border rounded-xl text-xs space-y-1.5 hover:border-border-strong transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-text leading-snug">
                    {paper.title || "Untitled Paper"}
                  </h4>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-accent hover:opacity-80 shrink-0"
                      title="View Paper / PDF"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {authors && (
                  <p className="text-text-secondary text-[11px]">
                    {authors}
                    {paper.published ? ` • ${String(paper.published).slice(0, 10)}` : ""}
                  </p>
                )}
                {summary && (
                  <div className="text-text leading-relaxed text-[11px] pt-1">
                    <p className={expanded[idx] ? "" : "line-clamp-2"}>{summary}</p>
                    <button
                      type="button"
                      onClick={() => toggleExpand(idx)}
                      className="mt-1 text-accent hover:underline flex items-center gap-0.5 text-[10px] font-medium cursor-pointer"
                    >
                      {expanded[idx] ? (
                        <>
                          Less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Read abstract <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Air Quality
  const isAirQuality =
    toolName.includes("air") ||
    toolName.includes("quality") ||
    list.some((item) => item?.aqi !== undefined || item?.pollutants !== undefined);

  if (isAirQuality) {
    const data = list[0];
    if (!data) return null;

    const aqi = data.aqi ?? data.aqi_index ?? data.overall_aqi;
    const category =
      data.category ||
      data.status ||
      (aqi !== undefined ? (aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : "Unhealthy") : "Report");

    return (
      <div className="mt-3 p-3.5 bg-bg-subtle/80 border border-border rounded-xl text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium text-text">
            <Wind className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold">
              {data.city || data.location || "Air Quality Measurement"}
            </span>
          </div>
          {aqi !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              AQI: {aqi} • {category}
            </span>
          )}
        </div>

        {data.pollutants && typeof data.pollutants === "object" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border">
            {Object.entries(data.pollutants).map(([key, val]) => (
              <div key={key} className="bg-surface p-2 rounded border border-border">
                <div className="text-[10px] uppercase text-text-tertiary font-mono">{key}</div>
                <div className="font-semibold text-text text-xs">{String(val)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Wikidata
  let entities: any[] = [];
  for (const item of list) {
    if (item?.entities && Array.isArray(item.entities)) {
      entities = [...entities, ...item.entities];
    } else if (item?.label || item?.concepturi || (item?.id && String(item.id).startsWith("Q"))) {
      entities.push(item);
    }
  }

  const isWikidata =
    entities.length > 0 ||
    toolName.includes("wikidata") ||
    toolName.includes("entity");

  if (isWikidata && entities.length > 0) {
    const displayEntities = entities;
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-tertiary uppercase tracking-wider">
          <Database className="w-3.5 h-3.5 text-accent" />
          <span>Knowledge Graph Entities ({displayEntities.length})</span>
        </div>
        <div className="space-y-1.5">
          {displayEntities.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-2.5 bg-bg-subtle/80 border border-border rounded-lg text-xs flex items-start justify-between gap-3 hover:border-border-strong transition-colors"
            >
              <div>
                <span className="font-semibold text-text">{item.label || item.id || "Entity"}</span>
                {item.id && (
                  <span className="ml-2 font-mono text-[10px] text-text-tertiary">({item.id})</span>
                )}
                {item.description && (
                  <p className="text-text-secondary text-[11px] mt-0.5">{item.description}</p>
                )}
              </div>
              {item.concepturi && (
                <a
                  href={item.concepturi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-accent hover:opacity-80 shrink-0 mt-0.5"
                  title="View on Wikidata"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
