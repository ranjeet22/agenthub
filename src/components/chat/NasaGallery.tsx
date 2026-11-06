"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExternalLink, X, ZoomIn, Calendar, Hash } from "lucide-react";

export interface NasaItem {
  nasa_id?: string;
  title: string;
  image_url: string;
  description?: string;
  date_created?: string;
  source_url?: string;
}

export interface NasaGalleryProps {
  items: NasaItem[];
}

export const NasaGallery: React.FC<NasaGalleryProps> = ({ items }) => {
  const [selectedImage, setSelectedImage] = useState<NasaItem | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
        <span>NASA Image Archive ({items.length} captures)</span>
        <span>Click photo to enlarge</span>
      </div>

      {/* Multi-Image Responsive Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <div
            key={item.nasa_id || idx}
            onClick={() => setSelectedImage(item)}
            className="group relative bg-bg-subtle/80 border border-border rounded-lg overflow-hidden cursor-pointer hover:border-border-strong hover:shadow-md transition-all duration-150 flex flex-col"
          >
            {/* Image Thumbnail Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
              <img
                src={item.image_url}
                alt={item.title || "NASA space image"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="w-6 h-6 drop-shadow-md" />
              </div>
            </div>

            {/* Caption & Metadata */}
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <h5 className="text-xs font-semibold text-text line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                {item.title}
              </h5>

              <div className="pt-1.5 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                {item.date_created && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {item.date_created.slice(0, 10)}
                  </span>
                )}
                {item.nasa_id && (
                  <span className="flex items-center gap-0.5 truncate max-w-[100px]">
                    <Hash className="w-2.5 h-2.5" />
                    {item.nasa_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-text truncate">
                  {selectedImage.title}
                </h4>
                {selectedImage.nasa_id && (
                  <span className="text-xs font-mono text-text-tertiary">
                    NASA ID: {selectedImage.nasa_id}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {selectedImage.source_url && (
                  <a
                    href={selectedImage.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-colors p-1"
                    title="Open on NASA official site"
                  >
                    <span>NASA Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1 rounded-md text-text-tertiary hover:text-text hover:bg-bg-subtle transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Large High-Res Photo View */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 min-h-[300px]">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>

            {/* Description Footer */}
            {selectedImage.description && (
              <div className="p-4 bg-bg-subtle text-xs text-text-secondary leading-relaxed max-h-32 overflow-y-auto">
                {selectedImage.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
