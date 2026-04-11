"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "../../components";
import { StatusBadge, PlatformPills } from "../components";
import { getCategoryLabel } from "@/lib/exchange";
import type { ExchangeListing } from "@/lib/exchange";

export default function MyListingsPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<ExchangeListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/exchange/my-listings");
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || []);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await fetch(`/api/exchange/listings/${id}`, { method: "DELETE" });
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("Failed to delete listing.");
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#E8EDF3] mb-4">Sign in required</h1>
          <Link href="/get-key" className="text-[#3B82F6] hover:text-[#2563EB]">
            Sign In
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
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/exchange" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">
              Exchange
            </Link>
            <span className="text-[#4B5563]">/</span>
            <span className="text-[#E8EDF3] font-medium">My Listings</span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#E8EDF3]">My Listings</h1>
            <Link
              href="/exchange/submit"
              className="inline-flex items-center px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
            >
              <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Listing
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] animate-pulse">
                  <div className="h-5 bg-[#374151] rounded w-1/3 mb-3" />
                  <div className="h-4 bg-[#374151] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]"
                >
                  <div className="flex items-start gap-4">
                    {listing.screenshot_url && (
                      <img
                        src={listing.screenshot_url}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover shrink-0 border border-[#374151]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-[#E8EDF3] truncate">
                          {listing.title}
                        </h3>
                        <StatusBadge status={listing.status} />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3">
                        <span>{getCategoryLabel(listing.category)}</span>
                        <span>
                          {listing.download_count} downloads
                        </span>
                        <span>
                          {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <PlatformPills platforms={listing.platforms} />

                      {listing.status === "rejected" && listing.rejection_reason && (
                        <div className="mt-3 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-lg px-3 py-2 text-sm text-[#DC2626]">
                          Rejection reason: {listing.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {listing.status === "approved" && (
                        <Link
                          href={`/exchange/${listing.slug}`}
                          className="px-3 py-1.5 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-[#E8EDF3] text-xs font-medium transition-colors"
                        >
                          View
                        </Link>
                      )}
                      <Link
                        href={`/exchange/edit/${listing.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#8B95A8] text-lg mb-4">
                You have not submitted any listings yet.
              </p>
              <Link
                href="/exchange/submit"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold transition-colors"
              >
                Submit Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
