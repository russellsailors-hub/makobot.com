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

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
            <Link
              href="/exchange"
              className="hover:text-[#3B82F6] transition-colors"
            >
              Exchange
            </Link>
            <span>/</span>
            <span className="text-[#8B95A8]">{listing.title}</span>
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
              <Link
                href={`/exchange/user/${listing.user_id}`}
                className="flex items-center gap-2 hover:text-[#3B82F6] transition-colors"
              >
                {listing.author_avatar && (
                  <img
                    src={listing.author_avatar}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>{listing.author_name}</span>
              </Link>
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
        </div>
      </div>

      <Footer />
    </div>
  );
}
