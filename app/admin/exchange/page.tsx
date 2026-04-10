"use client";

import { useState, useEffect } from "react";
import { StatusBadge, PlatformPills, ContentPreview } from "../../exchange/components";
import { getCategoryLabel } from "@/lib/exchange";
import type { ExchangeListing } from "@/lib/exchange";

export default function AdminExchangePage() {
  const [pending, setPending] = useState<ExchangeListing[]>([]);
  const [stats, setStats] = useState({ totalListings: 0, pendingCount: 0, approvedCount: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/exchange");
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending || []);
        setStats(data.stats || stats);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleModerate(listingId: number, action: "approve" | "reject") {
    try {
      const res = await fetch("/api/admin/exchange", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          action,
          reason: action === "reject" ? rejectReason : undefined,
        }),
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
    } catch {
      alert("Failed to moderate listing.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#E8EDF3] mb-6">Exchange Moderation</h1>

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

      {/* Pending Queue */}
      <h2 className="text-lg font-semibold text-[#E8EDF3] mb-4">
        Pending Review ({pending.length})
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] animate-pulse">
              <div className="h-5 bg-[#374151] rounded w-1/3 mb-3" />
              <div className="h-4 bg-[#374151] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : pending.length > 0 ? (
        <div className="space-y-4">
          {pending.map((listing) => (
            <div
              key={listing.id}
              className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-[#E8EDF3]">
                      {listing.title}
                    </h3>
                    <StatusBadge status={listing.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    <span>{getCategoryLabel(listing.category)}</span>
                    <span>by {listing.author_name} ({listing.author_email})</span>
                    <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Platforms */}
              <div className="mb-3">
                <PlatformPills platforms={listing.platforms} />
              </div>

              {/* Description */}
              <p className="text-sm text-[#C0C8D8] mb-3 leading-relaxed">
                {listing.description}
              </p>

              {/* Expandable content preview */}
              {listing.content && (
                <div className="mb-4">
                  <button
                    onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
                    className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium mb-2"
                  >
                    {expandedId === listing.id ? "Hide content" : "Preview content"}
                  </button>
                  {expandedId === listing.id && (
                    <ContentPreview content={listing.content} maxLines={30} />
                  )}
                </div>
              )}

              {listing.file_name && (
                <p className="text-xs text-[#6B7280] mb-3">
                  File: {listing.file_name} ({((listing.file_size || 0) / 1024).toFixed(1)}KB)
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#374151]/50">
                <button
                  onClick={() => handleModerate(listing.id, "approve")}
                  className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold transition-colors"
                >
                  Approve
                </button>

                {rejectId === listing.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (optional)"
                      className="flex-1 px-3 py-2 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#DC2626]"
                    />
                    <button
                      onClick={() => handleModerate(listing.id, "reject")}
                      className="px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold transition-colors"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setRejectId(null); setRejectReason(""); }}
                      className="px-3 py-2 text-sm text-[#8B95A8] hover:text-[#E8EDF3]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRejectId(listing.id)}
                    className="px-4 py-2 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] text-sm font-semibold transition-colors"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#252B3B] rounded-xl border border-[#374151]">
          <p className="text-[#8B95A8]">No pending listings to review.</p>
        </div>
      )}
    </div>
  );
}
