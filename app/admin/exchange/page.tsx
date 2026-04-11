"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge, PlatformPills, ContentPreview, StarRating } from "../../exchange/components";
import { getCategoryLabel, CATEGORIES, PLATFORMS } from "@/lib/exchange";
import type { ExchangeListing, ExchangeReview } from "@/lib/exchange";

type Tab = "pending" | "all" | "reviews";

export default function AdminExchangePage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<ExchangeListing[]>([]);
  const [allListings, setAllListings] = useState<ExchangeListing[]>([]);
  const [reviews, setReviews] = useState<(ExchangeReview & { listing_title?: string; listing_slug?: string })[]>([]);
  const [stats, setStats] = useState({ totalListings: 0, pendingCount: 0, approvedCount: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);

  // Filters for "All Listings" tab
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Moderation
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "", platforms: [] as string[], status: "", content: "" });

  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function loadTab(t: Tab) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("view", t);
      if (t === "all") {
        if (statusFilter) params.set("status", statusFilter);
        if (searchFilter) params.set("search", searchFilter);
      }
      const res = await fetch(`/api/admin/exchange?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats || stats);
      if (t === "pending") setPending(data.pending || []);
      if (t === "all") setAllListings(data.listings || []);
      if (t === "reviews") setReviews(data.reviews || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadTab(tab); }, [tab]);

  async function handleModerate(listingId: number, action: "approve" | "reject") {
    try {
      const res = await fetch("/api/admin/exchange", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action, reason: action === "reject" ? rejectReason : undefined }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((l) => l.id !== listingId));
        setRejectId(null);
        setRejectReason("");
        setStats((prev) => ({
          ...prev,
          pendingCount: prev.pendingCount - 1,
          approvedCount: action === "approve" ? prev.approvedCount + 1 : prev.approvedCount,
        }));
      }
    } catch { alert("Failed."); }
  }

  async function handleDeleteListing(id: number) {
    if (!confirm("Permanently delete this listing?")) return;
    try {
      await fetch(`/api/admin/exchange?listingId=${id}`, { method: "DELETE" });
      setAllListings((prev) => prev.filter((l) => l.id !== id));
      setPending((prev) => prev.filter((l) => l.id !== id));
      setStats((prev) => ({ ...prev, totalListings: prev.totalListings - 1 }));
    } catch { alert("Failed to delete."); }
  }

  async function handleDeleteReview(id: number) {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/admin/exchange?reviewId=${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch { alert("Failed to delete review."); }
  }

  function startEdit(listing: ExchangeListing) {
    setEditingId(listing.id);
    setEditForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      platforms: [...listing.platforms],
      status: listing.status,
      content: listing.content || "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      const res = await fetch("/api/admin/exchange", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: editingId, updates: editForm }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllListings((prev) => prev.map((l) => l.id === editingId ? { ...l, ...data.listing } : l));
        setEditingId(null);
      }
    } catch { alert("Failed to save."); }
  }

  function toggleEditPlatform(value: string) {
    setEditForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(value) ? prev.platforms.filter((p) => p !== value) : [...prev.platforms, value],
    }));
  }

  function renderListingCard(listing: ExchangeListing, showModeration: boolean) {
    const isEditing = editingId === listing.id;

    return (
      <div key={listing.id} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]">
        {isEditing ? (
          /* ─── EDIT MODE ─── */
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#8B95A8] mb-1 block">Title</label>
              <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="text-xs text-[#8B95A8] mb-1 block">Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6] resize-none" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-[#8B95A8] mb-1 block">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6]">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#8B95A8] mb-1 block">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6]">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#8B95A8] mb-1 block">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.value} type="button" onClick={() => toggleEditPlatform(p.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors ${editForm.platforms.includes(p.value) ? "text-white" : "bg-[#1E2330] text-[#8B95A8] border border-[#374151]"}`}
                    style={editForm.platforms.includes(p.value) ? { backgroundColor: p.color } : undefined}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#8B95A8] mb-1 block">Content</label>
              <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={6}
                className="w-full px-3 py-2 rounded-lg bg-[#1E2330] border border-[#374151] text-[#C0C8D8] text-sm font-mono focus:outline-none focus:border-[#3B82F6] resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold">Save</button>
              <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-[#E8EDF3] text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          /* ─── VIEW MODE ─── */
          <>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-semibold text-[#E8EDF3]">{listing.title}</h3>
                  <StatusBadge status={listing.status} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                  <span>{getCategoryLabel(listing.category)}</span>
                  <span>by <span className="text-[#3B82F6]">@{listing.author_username || listing.author_name}</span> ({listing.author_email})</span>
                  <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                  <span>{listing.download_count} downloads</span>
                  {listing.rating_count > 0 && (
                    <span className="flex items-center gap-1">
                      <StarRating rating={listing.rating_avg} size={12} />
                      ({listing.rating_count})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-3"><PlatformPills platforms={listing.platforms} /></div>

            <p className="text-sm text-[#C0C8D8] mb-3 leading-relaxed">{listing.description}</p>

            {listing.content && (
              <div className="mb-3">
                <button onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium mb-2">
                  {expandedId === listing.id ? "Hide content" : "Preview content"}
                </button>
                {expandedId === listing.id && <ContentPreview content={listing.content} maxLines={20} />}
              </div>
            )}

            {listing.file_name && (
              <p className="text-xs text-[#6B7280] mb-3">File: {listing.file_name} ({((listing.file_size || 0) / 1024).toFixed(1)}KB)</p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-[#374151]/50">
              {showModeration && listing.status === "pending" && (
                <>
                  <button onClick={() => handleModerate(listing.id, "approve")}
                    className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold">Approve</button>
                  {rejectId === listing.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (optional)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-xs focus:outline-none focus:border-[#DC2626]" />
                      <button onClick={() => handleModerate(listing.id, "reject")}
                        className="px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold">Reject</button>
                      <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                        className="text-xs text-[#8B95A8] hover:text-[#E8EDF3]">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setRejectId(listing.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] text-xs font-semibold">Reject</button>
                  )}
                </>
              )}
              <button onClick={() => startEdit(listing)}
                className="px-3 py-1.5 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-semibold">Edit</button>
              {listing.status !== "pending" && (
                <button onClick={() => handleModerate(listing.id, listing.status === "approved" ? "reject" : "approve")}
                  className="px-3 py-1.5 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-[#E8EDF3] text-xs font-medium">
                  {listing.status === "approved" ? "Unapprove" : "Approve"}
                </button>
              )}
              <button onClick={() => handleDeleteListing(listing.id)}
                className="px-3 py-1.5 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] text-xs font-semibold">Delete</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#E8EDF3]">Exchange Management</h1>
        <Link href="/admin/exchange/scrape" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub Scraper
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Listings", value: stats.totalListings },
          { label: "Pending Review", value: stats.pendingCount },
          { label: "Approved", value: stats.approvedCount },
          { label: "Total Downloads", value: stats.totalDownloads },
        ].map((s) => (
          <div key={s.label} className="bg-[#252B3B] rounded-xl p-4 border border-[#374151]">
            <p className="text-2xl font-bold text-[#3B82F6]">{s.value}</p>
            <p className="text-xs text-[#8B95A8] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { value: "pending", label: `Pending (${stats.pendingCount})` },
          { value: "all", label: "All Listings" },
          { value: "reviews", label: "Reviews" },
        ] as const).map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.value ? "bg-[#3B82F6] text-white" : "bg-[#252B3B] text-[#8B95A8] hover:text-[#E8EDF3] border border-[#374151]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* All Listings filters */}
      {tab === "all" && (
        <div className="flex gap-3 mb-4">
          <input value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder="Search title, description, email..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6]" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6]">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={() => loadTab("all")}
            className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold">Filter</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] animate-pulse">
              <div className="h-5 bg-[#374151] rounded w-1/3 mb-3" />
              <div className="h-4 bg-[#374151] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : tab === "pending" ? (
        pending.length > 0 ? (
          <div className="space-y-4">{pending.map((l) => renderListingCard(l, true))}</div>
        ) : (
          <div className="text-center py-12 bg-[#252B3B] rounded-xl border border-[#374151]">
            <p className="text-[#8B95A8]">No pending listings.</p>
          </div>
        )
      ) : tab === "all" ? (
        allListings.length > 0 ? (
          <div className="space-y-4">{allListings.map((l) => renderListingCard(l, false))}</div>
        ) : (
          <div className="text-center py-12 bg-[#252B3B] rounded-xl border border-[#374151]">
            <p className="text-[#8B95A8]">No listings found.</p>
          </div>
        )
      ) : (
        /* Reviews tab */
        reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#252B3B] rounded-lg p-4 border border-[#374151]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {review.reviewer_avatar && <img src={review.reviewer_avatar} alt="" className="w-6 h-6 rounded-full" />}
                    <span className="text-sm font-medium text-[#E8EDF3]">{review.reviewer_name}</span>
                    <span className="text-xs text-[#6B7280]">on</span>
                    <span className="text-sm text-[#3B82F6]">{review.listing_title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} size={14} />
                    <button onClick={() => handleDeleteReview(review.id)}
                      className="px-2 py-1 rounded text-xs text-[#DC2626] hover:bg-[#DC2626]/10">Delete</button>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-[#8B95A8]">{review.comment}</p>}
                <p className="text-xs text-[#4B5563] mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#252B3B] rounded-xl border border-[#374151]">
            <p className="text-[#8B95A8]">No reviews yet.</p>
          </div>
        )
      )}
    </div>
  );
}
