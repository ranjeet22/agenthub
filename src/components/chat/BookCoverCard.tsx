"use client";

import React, { useState } from "react";
import { BookOpen, ExternalLink, Calendar, Hash, Layers } from "lucide-react";

export interface BookItem {
  title: string;
  author_name?: string[];
  authors?: string[];
  first_publish_year?: number;
  cover_url?: string;
  cover_image_url?: string;
  cover_id?: number | string;
  cover_i?: number | string;
  source_url?: string;
  edition_count?: number;
  isbn?: string[];
  publisher?: string[];
  publishers?: string[];
}

export interface BookCoverCardProps {
  books: BookItem[];
}

function BookCardItem({ book }: { book: BookItem }) {
  const [imageError, setImageError] = useState(false);

  // Determine candidate cover URL from all possible properties
  const rawCover =
    book.cover_url ||
    book.cover_image_url ||
    (book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` : null) ||
    (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null) ||
    (book.isbn && book.isbn.length > 0 ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg` : null);

  const authorsList = book.authors || book.author_name;
  const publishersList = book.publishers || book.publisher;
  const hasValidImage = Boolean(rawCover && !imageError);

  return (
    <div className="group bg-surface border border-border rounded-xl p-3.5 flex gap-3.5 hover:border-border-strong hover:shadow-xs transition-all duration-150">
      {/* Book Cover Jacket */}
      <div className="w-18 sm:w-20 shrink-0 aspect-[2/3] rounded bg-bg-subtle border border-border overflow-hidden relative flex items-center justify-center shadow-2xs">
        {hasValidImage ? (
          <img
            src={rawCover!}
            alt={`Cover of ${book.title}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-center text-text-tertiary">
            <BookOpen className="w-6 h-6 mb-1 opacity-50 stroke-1" />
            <span className="text-[9px] font-mono leading-tight">No Cover</span>
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h5 className="text-xs sm:text-sm font-semibold text-text line-clamp-2 mb-1 group-hover:text-agent-biblio transition-colors">
            {book.title}
          </h5>

          {authorsList && authorsList.length > 0 && (
            <p className="text-xs text-text-secondary line-clamp-1 mb-1.5">
              by {authorsList.join(", ")}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-2">
            {book.first_publish_year && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-tertiary bg-bg-subtle px-1.5 py-0.5 rounded border border-border/70">
                <Calendar className="w-2.5 h-2.5" />
                {book.first_publish_year}
              </span>
            )}
            {book.edition_count && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-tertiary bg-bg-subtle px-1.5 py-0.5 rounded border border-border/70">
                <Layers className="w-2.5 h-2.5" />
                {book.edition_count} editions
              </span>
            )}
            {publishersList && publishersList.length > 0 && (
              <span className="text-[10px] font-mono text-text-tertiary line-clamp-1">
                {publishersList[0]}
              </span>
            )}
          </div>
        </div>

        {/* Source Link */}
        {book.source_url && (
          <div className="pt-1.5 border-t border-border/50 flex justify-end">
            <a
              href={book.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-agent-biblio hover:underline"
            >
              <span>Open Library</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export const BookCoverCard: React.FC<BookCoverCardProps> = ({ books }) => {
  if (!books || books.length === 0) return null;

  return (
    <div className="w-full space-y-3 pt-2">
      <div className="text-xs font-mono text-text-tertiary">
        <span>Catalog Records ({books.length} titles from Open Library)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {books.map((book, idx) => (
          <BookCardItem key={(book.title || "") + idx} book={book} />
        ))}
      </div>
    </div>
  );
};
