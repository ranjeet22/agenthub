"use client";

import React, { useState } from "react";
import { ExternalLink, Palette, ZoomIn, X } from "lucide-react";

interface MetArtwork {
  object_id?: number | string;
  title?: string;
  artist?: string;
  artist_bio?: string;
  date?: string;
  medium?: string;
  dimensions?: string;
  classification?: string;
  department?: string;
  culture?: string;
  primary_image?: string;
  primary_image_small?: string;
  object_url?: string;
}

interface ArtworkCardProps {
  artworks: MetArtwork[];
}

export function ArtworkCard({ artworks }: ArtworkCardProps) {
  const [selectedArt, setSelectedArt] = useState<MetArtwork | null>(null);

  if (!artworks || artworks.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-mono text-text-tertiary uppercase tracking-wider">
        <Palette className="w-3.5 h-3.5 text-accent" />
        <span>The Metropolitan Museum of Art Collection ({artworks.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {artworks.map((art, idx) => {
          const imgUrl = art.primary_image_small || art.primary_image;
          const hasImage = Boolean(imgUrl && imgUrl.startsWith("http"));

          return (
            <div
              key={art.object_id || idx}
              className="group relative flex flex-col bg-bg-subtle/80 border border-border rounded-xl overflow-hidden hover:border-border-strong hover:shadow-sm transition-all"
            >
              {/* Framed Image Container */}
              <div
                className="relative w-full aspect-[4/3] bg-black/10 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => hasImage && setSelectedArt(art)}
              >
                {hasImage ? (
                  <>
                    <img
                      src={imgUrl}
                      alt={art.title || "The Met Artwork"}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="p-2 rounded-full bg-surface text-text shadow-sm">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-text-tertiary p-4 text-center">
                    <Palette className="w-8 h-8 stroke-1 mb-1 opacity-60" />
                    <span className="text-[11px]">Image unavailable in public domain</span>
                  </div>
                )}
              </div>

              {/* Artwork Details */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text line-clamp-1 group-hover:text-accent transition-colors">
                    {art.title || "Untitled"}
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                    {art.artist || "Unknown Artist"}
                    {art.date ? ` • ${art.date}` : ""}
                  </p>
                  {art.medium && (
                    <p className="text-[11px] text-text-tertiary line-clamp-1 mt-1 italic">
                      {art.medium}
                    </p>
                  )}
                  {art.department && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-mono bg-bg-subtle text-text-secondary border border-border rounded">
                      {art.department}
                    </span>
                  )}
                </div>

                {art.object_url && (
                  <a
                    href={art.object_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2"
                  >
                    <span>View in The Met Collection</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Lightbox for viewing high-res artwork */}
      {selectedArt && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedArt(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArt(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 bg-black/90 flex items-center justify-center overflow-auto p-4 max-h-[60vh]">
              <img
                src={selectedArt.primary_image || selectedArt.primary_image_small}
                alt={selectedArt.title || "The Met Artwork"}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>

            <div className="p-5 border-t border-border bg-surface text-text">
              <h3 className="text-base font-semibold text-text">
                {selectedArt.title || "Untitled"}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {selectedArt.artist || "Unknown Artist"}
                {selectedArt.artist_bio ? ` (${selectedArt.artist_bio})` : ""}
                {selectedArt.date ? ` • ${selectedArt.date}` : ""}
              </p>
              {selectedArt.medium && (
                <p className="text-xs text-text-tertiary mt-1">
                  <span className="font-medium text-text-secondary">Medium:</span> {selectedArt.medium}
                </p>
              )}
              {selectedArt.dimensions && (
                <p className="text-xs text-text-tertiary">
                  <span className="font-medium text-text-secondary">Dimensions:</span> {selectedArt.dimensions}
                </p>
              )}
              {selectedArt.object_url && (
                <div className="mt-3">
                  <a
                    href={selectedArt.object_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text bg-bg-subtle hover:bg-surface border border-border rounded-lg transition-colors"
                  >
                    <span>View full catalog entry at metmuseum.org</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
