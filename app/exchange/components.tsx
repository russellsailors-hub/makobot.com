"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CATEGORIES, PLATFORMS, getPlatformColor, getCategoryLabel } from "@/lib/exchange";
import type { ExchangeListing, ExchangeReview } from "@/lib/exchange";

/* ─── EXCHANGE SUB-NAV ─── */
export function ExchangeNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/exchange", label: "Browse", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "#3B82F6" },
    { href: "/exchange/collections", label: "Collections", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", color: "#EC4899" },
    { href: "/exchange/requests", label: "Requests", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01", color: "#F59E0B" },
    { href: "/exchange/submit", label: "Submit", icon: "M12 5v14M5 12h14", color: "#10B981" },
    { href: "/exchange/my-listings", label: "My Listings", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", color: "#3B82F6", auth: true },
  ];

  return (
    <div className="bg-[#1E2330] border-b border-[#374151]">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {links.map((link) => {
            if (link.auth && !session?.user) return null;
            const active = pathname === link.href || (link.href !== "/exchange" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-[3px] ${
                  active
                    ? "bg-[#252B3B]"
                    : "border-transparent hover:bg-[#252B3B]/50"
                }`}
                style={{ color: link.color, borderBottomColor: active ? link.color : "transparent" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={link.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={link.icon} />
                </svg>
                {link.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/"
          className="text-xs text-[#8B95A8] hover:text-[#3B82F6] transition-colors hidden sm:flex items-center gap-1 font-medium"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          MakoBot
        </Link>
      </div>
    </div>
  );
}

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

  return (
    <div className="relative">
      <pre
        className={`bg-[#1E2330] rounded-lg p-4 text-sm text-[#C0C8D8] font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed border border-[#374151] transition-all duration-300 styled-scrollbar ${
          expanded ? "max-h-none" : "max-h-[400px] overflow-y-auto"
        }`}
      >
        {content}
      </pre>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
        >
          {expanded ? "Collapse" : "Expand all"}
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

/* ─── INSTALL BOX ─── */
export function InstallBox({
  listing,
}: {
  listing: ExchangeListing & { has_file?: boolean };
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const installMethods = getInstallMethods(listing, url);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (installMethods.length === 0) return null;

  return (
    <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]">
      <h3 className="text-sm font-semibold text-[#E8EDF3] mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        Quick Install
      </h3>
      <div className="space-y-3">
        {installMethods.map((method) => (
          <div key={method.label}>
            <p className="text-xs text-[#6B7280] mb-1">{method.label}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-[#1E2330] rounded-lg px-3 py-2 text-sm text-[#C0C8D8] font-mono border border-[#374151] overflow-x-auto">
                {method.command}
              </code>
              <button
                onClick={() => copyToClipboard(method.command, method.label)}
                className="shrink-0 px-3 py-2 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-xs text-[#E8EDF3] font-medium transition-colors"
              >
                {copied === method.label ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getInstallMethods(listing: ExchangeListing & { has_file?: boolean }, url: string) {
  const methods: { label: string; command: string }[] = [];
  const platforms = listing.platforms || [];

  if (listing.category === "configs") {
    if (platforms.includes("claude")) {
      methods.push({ label: "Copy to CLAUDE.md", command: `# Paste into ~/.claude/CLAUDE.md` });
    }
    if (platforms.includes("cursor")) {
      methods.push({ label: "Copy to .cursorrules", command: `# Paste into .cursorrules in your project root` });
    }
    if (platforms.includes("windsurf")) {
      methods.push({ label: "Copy to .windsurfrules", command: `# Paste into .windsurfrules in your project root` });
    }
  }

  if (listing.category === "mcp") {
    methods.push({ label: "Add to MCP config", command: `# Paste into your MCP client config (claude_desktop_config.json)` });
  }

  if (listing.content) {
    methods.push({ label: "Copy content to clipboard", command: listing.content.slice(0, 200) + (listing.content.length > 200 ? "..." : "") });
  }

  // Always show the share URL
  if (url) {
    methods.push({ label: "Share this listing", command: url });
  }

  return methods;
}

/* ─── SHARE BUTTON ─── */
export function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/exchange/${slug}` : "";

  function share() {
    if (navigator.share) {
      navigator.share({ url, title: "Check out this AI skill" });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#252B3B] border border-[#374151] hover:border-[#3B82F6]/50 text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

/* ─── COPY CONTENT BUTTON ─── */
export function CopyContentButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#252B3B] border border-[#374151] hover:border-[#3B82F6]/50 text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      {copied ? "Copied" : "Copy All Content"}
    </button>
  );
}

/* ─── REMIX / FORK BUTTON ─── */
export function RemixButton({ listing }: { listing: ExchangeListing }) {
  return (
    <Link
      href={`/exchange/submit?remix=${listing.id}&title=${encodeURIComponent("Remix of " + listing.title)}&category=${listing.category}&platforms=${encodeURIComponent(JSON.stringify(listing.platforms))}`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 hover:bg-[#3B82F6]/20 text-sm text-[#3B82F6] font-medium transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
        <path d="M6 9a9 9 0 0 0 9 9" />
      </svg>
      Remix
    </Link>
  );
}

/* ─── TRENDING BADGE ─── */
export function TrendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/15 text-[#F59E0B]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
      Trending
    </span>
  );
}

/* ─── TRENDING SECTION ─── */
export function TrendingSection({
  trending,
  featured,
}: {
  trending: ExchangeListing[];
  featured: ExchangeListing[];
}) {
  if (trending.length === 0 && featured.length === 0) return null;

  return (
    <section className="px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h2 className="text-lg font-bold text-[#E8EDF3]">Featured</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((listing) => (
                <div key={listing.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#3B82F6] text-white shadow-lg">
                      Featured
                    </span>
                  </div>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2.5}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <h2 className="text-lg font-bold text-[#E8EDF3]">Trending</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
