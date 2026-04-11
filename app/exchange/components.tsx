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
    { href: "/exchange/creator-analytics", label: "Analytics", icon: "M3 3v18h18M7 12l3-3 4 4 5-5", color: "#10B981", auth: true },
    { href: "/exchange/profile", label: "My Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z", color: "#F59E0B", auth: true },
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
      className="block bg-[#252B3B] rounded-xl border border-[#374151] feature-card overflow-hidden"
    >
      {/* Screenshot */}
      {listing.screenshot_url && (
        <img
          src={listing.screenshot_url}
          alt={`Preview of ${listing.title}`}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-5">
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
        {listing.source_author ? (
          <a
            href={`https://github.com/${listing.source_author}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B95A8"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span className="text-xs text-[#3B82F6] font-medium">
              @{listing.source_author}
            </span>
          </a>
        ) : (
          <a
            href={`/exchange/user/${listing.user_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {listing.author_avatar && (
              <img
                src={listing.author_avatar}
                alt=""
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="text-xs text-[#3B82F6] font-medium">
              @{listing.author_username || "user"}
            </span>
          </a>
        )}
        {listing.rating_count > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={listing.rating_avg} size={12} />
            <span className="text-xs text-[#6B7280]">
              ({listing.rating_count})
            </span>
          </div>
        )}
      </div>
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
        <Link href={`/exchange/user/${review.user_id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {review.reviewer_avatar && (
            <img
              src={review.reviewer_avatar}
              alt=""
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-[#3B82F6]">
            @{review.reviewer_username || "user"}
          </span>
        </Link>
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

/* ─── TRY IT SANDBOX (Bring Your Own Key) ─── */
type Provider = "anthropic" | "openai" | "google";

const PROVIDER_INFO: Record<Provider, { label: string; model: string; keyLabel: string; keyPrefix: string; docsUrl: string }> = {
  anthropic: {
    label: "Claude",
    model: "claude-haiku-4-5",
    keyLabel: "Anthropic API Key",
    keyPrefix: "sk-ant-",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  openai: {
    label: "ChatGPT",
    model: "gpt-4o-mini",
    keyLabel: "OpenAI API Key",
    keyPrefix: "sk-",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  google: {
    label: "Gemini",
    model: "gemini-2.0-flash",
    keyLabel: "Google AI Studio API Key",
    keyPrefix: "",
    docsUrl: "https://aistudio.google.com/apikey",
  },
};

export function TryItSandbox({ content }: { content: string }) {
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [saveKey, setSaveKey] = useState(false);

  // Load saved key from localStorage on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`makobot_key_${provider}`);
      if (saved) {
        setApiKey(saved);
        setSaveKey(true);
      }
    }
  });

  function switchProvider(p: Provider) {
    setProvider(p);
    setError(null);
    setResult("");
    // Load saved key for new provider
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`makobot_key_${p}`);
      setApiKey(saved || "");
      setSaveKey(!!saved);
    }
  }

  async function runSandbox() {
    setError(null);
    setResult("");

    if (!apiKey.trim()) {
      setError(`Please paste your ${PROVIDER_INFO[provider].keyLabel}`);
      return;
    }

    if (!userInput.trim()) {
      setError("Please enter some input to test with");
      return;
    }

    // Save key to localStorage if requested
    if (saveKey && typeof window !== "undefined") {
      localStorage.setItem(`makobot_key_${provider}`, apiKey.trim());
    } else if (typeof window !== "undefined") {
      localStorage.removeItem(`makobot_key_${provider}`);
    }

    setRunning(true);

    try {
      let responseText = "";

      if (provider === "anthropic") {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey.trim(),
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: PROVIDER_INFO.anthropic.model,
            max_tokens: 2048,
            system: content,
            messages: [{ role: "user", content: userInput }],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "API error");
        responseText = data.content?.[0]?.text || "No response";
      } else if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: PROVIDER_INFO.openai.model,
            messages: [
              { role: "system", content },
              { role: "user", content: userInput },
            ],
            max_tokens: 2048,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "API error");
        responseText = data.choices?.[0]?.message?.content || "No response";
      } else if (provider === "google") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDER_INFO.google.model}:generateContent?key=${apiKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: content }] },
              contents: [{ role: "user", parts: [{ text: userInput }] }],
              generationConfig: { maxOutputTokens: 2048 },
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "API error");
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      }

      setResult(responseText);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }

    setRunning(false);
  }

  return (
    <div className="bg-[#252B3B] rounded-xl border border-[#374151] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#374151] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <h3 className="text-base font-semibold text-[#E8EDF3]">Try It Now</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] font-semibold">BETA</span>
        </div>
        <div className="text-xs text-[#6B7280]">
          Your key stays in your browser
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Provider tabs */}
        <div className="flex gap-2">
          {(Object.keys(PROVIDER_INFO) as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => switchProvider(p)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                provider === p
                  ? "bg-[#3B82F6] text-white"
                  : "bg-[#1E2330] text-[#8B95A8] border border-[#374151] hover:text-[#E8EDF3]"
              }`}
            >
              {PROVIDER_INFO[p].label}
            </button>
          ))}
        </div>

        {/* API Key */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-[#8B95A8]">{PROVIDER_INFO[provider].keyLabel}</label>
            <a href={PROVIDER_INFO[provider].docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3B82F6] hover:text-[#60A5FA]">
              Get a key
            </a>
          </div>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`${PROVIDER_INFO[provider].keyPrefix}...`}
              className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm font-mono placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6]"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#E8EDF3] p-1"
            >
              {showKey ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <label className="flex items-center gap-2 mt-2 text-xs text-[#6B7280] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveKey}
              onChange={(e) => setSaveKey(e.target.checked)}
              className="accent-[#3B82F6]"
            />
            Remember this key (saved in your browser only)
          </label>
        </div>

        {/* User Input */}
        <div>
          <label className="block text-xs text-[#8B95A8] mb-1">Your input</label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={3}
            placeholder="Type something to test the skill..."
            className="w-full px-3 py-2.5 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] resize-none"
          />
        </div>

        {/* Run button */}
        <button
          onClick={runSandbox}
          disabled={running}
          className="w-full py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {running ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Running on {PROVIDER_INFO[provider].label}...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
              </svg>
              Run with {PROVIDER_INFO[provider].label}
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#8B95A8]">Response from {PROVIDER_INFO[provider].label}</label>
              <button
                onClick={() => { navigator.clipboard.writeText(result); }}
                className="text-xs text-[#3B82F6] hover:text-[#60A5FA] font-medium"
              >
                Copy
              </button>
            </div>
            <div className="bg-[#1E2330] rounded-lg p-4 text-sm text-[#C0C8D8] border border-[#374151] whitespace-pre-wrap max-h-[400px] overflow-y-auto styled-scrollbar">
              {result}
            </div>
          </div>
        )}

        {/* Privacy note */}
        <div className="text-xs text-[#6B7280] bg-[#1E2330] rounded-lg p-3 border border-[#374151]">
          <strong className="text-[#8B95A8]">Privacy:</strong> Your API key is sent directly from your browser to {PROVIDER_INFO[provider].label}. It never passes through MakoBot servers. Want this built in? <a href="/#download" className="text-[#3B82F6] hover:text-[#60A5FA]">Get MakoBot</a> — the desktop app manages all your AI sessions and memory locally.
        </div>
      </div>
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
