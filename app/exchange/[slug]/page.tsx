"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "../../components";
import {
  PlatformPills,
  StarRating,
  ContentPreview,
  ReviewCard,
  InstallBox,
  ShareButton,
  CopyContentButton,
  RemixButton,
  ListingCard,
  TryItSandbox,
} from "../components";
import { getCategoryLabel } from "@/lib/exchange";
import type { ExchangeListing, ExchangeReview } from "@/lib/exchange";

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [listing, setListing] = useState<(ExchangeListing & { has_file?: boolean }) | null>(null);
  const [reviews, setReviews] = useState<ExchangeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [related, setRelated] = useState<(ExchangeListing)[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/exchange/listings?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          setError("Listing not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setListing(data.listing);
        setReviews(data.reviews || []);
        // Load related listings
        if (data.listing) {
          fetch(`/api/exchange/related?id=${data.listing.id}&category=${data.listing.category}`)
            .then(r => r.json())
            .then(d => setRelated(d.related || []))
            .catch(() => {});
        }
      } catch {
        setError("Failed to load listing");
      }
      setLoading(false);
    }
    if (slug) load();
  }, [slug]);

  async function handleDownload() {
    if (!listing) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/exchange/listings/${listing.id}/download`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        listing.file_name || (listing.content ? "content.txt" : "download");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update local download count
      setListing((prev) =>
        prev ? { ...prev, download_count: prev.download_count + 1 } : prev
      );
    } catch {
      alert("Download failed. Please try again.");
    }
    setDownloading(false);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!listing || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(
        `/api/exchange/listings/${listing.id}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewComment.trim() || null,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [data.review, ...prev]);
        setReviewRating(0);
        setReviewComment("");
        // Re-fetch listing to get updated rating
        const listingRes = await fetch(`/api/exchange/listings?slug=${encodeURIComponent(slug)}`);
        if (listingRes.ok) {
          const listingData = await listingRes.json();
          setListing(listingData.listing);
        }
      }
    } catch {
      alert("Failed to submit review.");
    }
    setSubmittingReview(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#374151] rounded w-2/3" />
            <div className="h-4 bg-[#374151] rounded w-full" />
            <div className="h-4 bg-[#374151] rounded w-3/4" />
            <div className="h-64 bg-[#374151] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#E8EDF3] mb-4">
            {error || "Listing not found"}
          </h1>
          <Link
            href="/exchange"
            className="text-[#3B82F6] hover:text-[#2563EB] text-sm"
          >
            Back to Exchange
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MakoBot", item: "https://makobot.com" },
          { "@type": "ListItem", position: 2, name: "AI Skills Exchange", item: "https://makobot.com/exchange" },
          { "@type": "ListItem", position: 3, name: listing.title },
        ],
      },
      {
        "@type": "CreativeWork",
        name: listing.title,
        description: listing.description,
        author: { "@type": "Person", name: listing.author_username || "Community" },
        datePublished: listing.created_at,
        dateModified: listing.updated_at,
        url: `https://makobot.com/exchange/${listing.slug}`,
        ...(listing.rating_count > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(listing.rating_avg).toFixed(1),
            ratingCount: listing.rating_count,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link
              href="/exchange"
              className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors"
            >
              Exchange
            </Link>
            <span className="text-[#4B5563]">/</span>
            <span className="text-[#E8EDF3] font-medium">{listing.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
              {getCategoryLabel(listing.category)}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#E8EDF3] mt-2 mb-3">
              {listing.title}
            </h1>

            {/* Author + stats row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#8B95A8]">
              {listing.source_author ? (
                <a
                  href={`https://github.com/${listing.source_author}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#8B95A8"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span className="text-[#3B82F6] font-medium">@{listing.source_author}</span>
                </a>
              ) : (
                <Link
                  href={`/exchange/user/${listing.user_id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {listing.author_avatar && (
                    <img
                      src={listing.author_avatar}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-[#3B82F6] font-medium">@{listing.author_username || "user"}</span>
                </Link>
              )}
              <span>
                {new Date(listing.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {listing.download_count} downloads
              </span>
              {listing.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <StarRating rating={listing.rating_avg} size={14} />
                  <span>
                    {Number(listing.rating_avg).toFixed(1)} ({listing.rating_count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Platforms */}
          <div className="mb-4">
            <PlatformPills platforms={listing.platforms} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <ShareButton slug={listing.slug} />
            {listing.content && <CopyContentButton content={listing.content} />}
            <RemixButton listing={listing} />
          </div>

          {/* Source info (for community imports) */}
          {listing.source_url && (
            <div className="bg-[#252B3B] rounded-xl p-4 border border-[#374151] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#8B95A8"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <div>
                  <p className="text-sm text-[#E8EDF3]">
                    Imported from GitHub
                    {listing.source_author && (
                      <> by <a href={`https://github.com/${listing.source_author}`} target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:text-[#60A5FA]">@{listing.source_author}</a></>
                    )}
                  </p>
                  <a href={listing.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6B7280] hover:text-[#3B82F6] transition-colors break-all">
                    {listing.source_url}
                  </a>
                </div>
              </div>
              {session?.user && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/exchange/listings/${listing.id}/claim`, { method: "POST" });
                      const d = await res.json();
                      if (res.ok) {
                        alert(d.message);
                        if (d.autoApproved) window.location.reload();
                      } else { alert(d.error || "Failed to claim."); }
                    } catch { alert("Failed to claim."); }
                  }}
                  className="shrink-0 px-4 py-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-sm font-semibold hover:bg-[#F59E0B]/20 transition-colors"
                >
                  Claim
                </button>
              )}
            </div>
          )}

          {/* Install Box */}
          <div className="mb-6">
            <InstallBox listing={listing} />
          </div>

          {/* Screenshot */}
          {listing.screenshot_url && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#E8EDF3] mb-3">Preview</h2>
              <img
                src={listing.screenshot_url}
                alt={`Screenshot of ${listing.title}`}
                className="w-full rounded-xl border border-[#374151]"
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151] mb-6">
            <h2 className="text-lg font-semibold text-[#E8EDF3] mb-3">
              About
            </h2>
            <p className="text-sm text-[#C0C8D8] leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Try It Sandbox */}
          {listing.content && ["prompts", "configs", "skills", "agents"].includes(listing.category) && (
            <div className="mb-6">
              <TryItSandbox content={listing.content} />
            </div>
          )}

          {/* Content Preview */}
          {listing.content && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#E8EDF3] mb-3">
                Content
              </h2>
              <ContentPreview content={listing.content} />
            </div>
          )}

          {/* Download Button */}
          {(listing.content || listing.has_file) && (
            <div className="mb-10">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center px-8 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold text-base transition-colors"
              >
                <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {downloading ? "Downloading..." : "Download"}
                {listing.file_name && (
                  <span className="ml-2 text-white/60 text-sm">
                    ({listing.file_name})
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Reviews Section */}
          <div className="border-t border-[#374151] pt-8">
            <h2 className="text-xl font-bold text-[#E8EDF3] mb-6">
              Reviews{" "}
              {listing.rating_count > 0 && (
                <span className="text-[#8B95A8] font-normal text-base">
                  ({listing.rating_count})
                </span>
              )}
            </h2>

            {/* Review form */}
            {session?.user ? (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] mb-6"
              >
                <p className="text-sm font-medium text-[#E8EDF3] mb-3">
                  Leave a review
                </p>
                <div className="mb-3">
                  <StarRating
                    rating={reviewRating}
                    size={24}
                    interactive
                    onRate={setReviewRating}
                  />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Optional comment..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={reviewRating === 0 || submittingReview}
                  className="mt-3 px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] mb-6 text-center">
                <p className="text-sm text-[#8B95A8]">
                  <Link
                    href="/get-key"
                    className="text-[#3B82F6] hover:text-[#2563EB]"
                  >
                    Sign in
                  </Link>{" "}
                  to leave a review.
                </p>
              </div>
            )}

            {/* Review list */}
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">
                No reviews yet. Be the first to review this listing.
              </p>
            )}
          </div>

          {/* Also Popular */}
          {related.length > 0 && (
            <div className="border-t border-[#374151] pt-8 mt-8">
              <h2 className="text-xl font-bold text-[#E8EDF3] mb-6">Also Popular in {getCategoryLabel(listing.category)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((r) => (
                  <ListingCard key={r.id} listing={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
