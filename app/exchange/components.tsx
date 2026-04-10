"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, PLATFORMS, getPlatformColor, getCategoryLabel } from "@/lib/exchange";
import type { ExchangeListing, ExchangeReview } from "@/lib/exchange";

/* ─── CATEGORY TABS ─── */
export function CategoryTabs({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (val: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selected === null
            ? "bg-[#3B82F6] text-white"
            : "bg-[#252B3B] text-[#8B95A8] hover:text-[#E8EDF3] border border-[#374151]"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === cat.value
              ? "bg-[#3B82F6] text-white"
              : "bg-[#252B3B] text-[#8B95A8] hover:text-[#E8EDF3] border border-[#374151]"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

/* ─── PLATFORM FILTER ─── */
export function PlatformFilter({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (val: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
          selected === null
            ? "bg-[#3B82F6] text-white"
            : "bg-[#252B3B] text-[#8B95A8] hover:text-[#E8EDF3] border border-[#374151]"
        }`}
      >
        All Platforms
      </button>
      {PLATFORMS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            selected === p.value
              ? "text-white"
              : "bg-[#252B3B] text-[#8B95A8] hover:text-[#E8EDF3] border border-[#374151]"
          }`}
          style={selected === p.value ? { backgroundColor: p.color } : undefined}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ─── SEARCH BAR ─── */
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder="Search skills, prompts, configs..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
      />
    </div>
  );
}

/* ─── SORT DROPDOWN ─── */
export function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
    >
      <option value="newest">Newest</option>
      <option value="top-rated">Top Rated</option>
      <option value="most-downloaded">Most Downloaded</option>
    </select>
  );
}

/* ─── STAR RATING ─── */
export function StarRating({
  rating,
  size = 16,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? star <= (hover || rating) : star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? "#F59E0B" : "none"}
              stroke={filled ? "#F59E0B" : "#4B5563"}
              strokeWidth={2}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/* ─── STATUS BADGE ─── */
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-[#F59E0B]/20 text-[#F59E0B]",
    approved: "bg-[#10B981]/20 text-[#10B981]",
    rejected: "bg-[#DC2626]/20 text-[#DC2626]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        colors[status] || "bg-[#374151] text-[#8B95A8]"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── PLATFORM PILLS (display) ─── */
export function PlatformPills({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {platforms.map((p) => (
        <span
          key={p}
          className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: getPlatformColor(p) }}
        >
          {PLATFORMS.find((pl) => pl.value === p)?.label || p}
        </span>
      ))}
    </div>
  );
}

/* ─── LISTING CARD ─── */
export function ListingCard({ listing }: { listing: ExchangeListing }) {
  return (
    <Link
      href={`/exchange/${listing.slug}`}
      className="block bg-[#252B3B] rounded-xl p-5 border border-[#374151] feature-card"
    >
      {/* Category label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
          {getCategoryLabel(listing.category)}
        </span>
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {listing.download_count}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-[#E8EDF3] mb-2 line-clamp-2">
        {listing.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#8B95A8] mb-4 line-clamp-2 leading-relaxed">
        {listing.description}
      </p>

      {/* Platforms */}
      <PlatformPills platforms={listing.platforms} />

      {/* Footer: rating + author */}
      <div className="mt-4 pt-3 border-t border-[#374151]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {listing.author_avatar && (
            <img
              src={listing.author_avatar}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="text-xs text-[#6B7280]">{listing.author_name}</span>
        </div>
        {listing.rating_count > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={listing.rating_avg} size={12} />
            <span className="text-xs text-[#6B7280]">
              ({listing.rating_count})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── CONTENT PREVIEW ─── */
export function ContentPreview({
  content,
  maxLines = 15,
}: {
  content: string;
  maxLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split("\n");
  const needsTruncation = lines.length > maxLines;
  const displayContent = expanded ? content : lines.slice(0, maxLines).join("\n");

  return (
    <div className="relative">
      <pre className="bg-[#1E2330] rounded-lg p-4 text-sm text-[#C0C8D8] font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed border border-[#374151]">
        {displayContent}
      </pre>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
        >
          {expanded ? "Show less" : `Show all ${lines.length} lines`}
        </button>
      )}
    </div>
  );
}

/* ─── REVIEW CARD ─── */
export function ReviewCard({ review }: { review: ExchangeReview }) {
  return (
    <div className="bg-[#252B3B] rounded-lg p-4 border border-[#374151]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {review.reviewer_avatar && (
            <img
              src={review.reviewer_avatar}
              alt=""
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-[#E8EDF3]">
            {review.reviewer_name}
          </span>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      {review.comment && (
        <p className="text-sm text-[#8B95A8] leading-relaxed">{review.comment}</p>
      )}
      <p className="text-xs text-[#4B5563] mt-2">
        {new Date(review.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

/* ─── EMPTY STATE ─── */
export function ExchangeEmpty({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4 opacity-30">
        <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-[#8B95A8] text-lg">{message}</p>
      <p className="text-[#6B7280] text-sm mt-2">
        Try adjusting your filters or search terms.
      </p>
    </div>
  );
}
