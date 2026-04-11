"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "../../components";
import { StarRating } from "../components";

interface Analytics {
  totals: { listings: number; views: number; downloads: number; avgRating: number; reviews: number };
  topListings: Array<{ id: number; title: string; slug: string; view_count: number; download_count: number; rating_avg: number; rating_count: number }>;
  downloadsPerDay: Array<{ date: string; count: number }>;
}

export default function CreatorAnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange/creator-analytics")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!session?.user) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#E8EDF3] mb-4">Sign in required</h1>
          <Link href="/get-key" className="text-[#3B82F6]">Sign In</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const maxDaily = Math.max(1, ...(data?.downloadsPerDay.map(d => d.count) || [0]));

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/exchange" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium">Exchange</Link>
            <span className="text-[#4B5563]">/</span>
            <span className="text-[#E8EDF3] font-medium">Creator Analytics</span>
          </div>

          <h1 className="text-3xl font-bold text-[#E8EDF3] mb-2">Creator Analytics</h1>
          <p className="text-[#8B95A8] mb-8">Track how your listings are performing on the exchange.</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] animate-pulse">
                  <div className="h-8 bg-[#374151] rounded w-20 mb-2" />
                  <div className="h-3 bg-[#374151] rounded w-16" />
                </div>
              ))}
            </div>
          ) : data ? (
            <>
              {/* Totals */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]">
                  <p className="text-3xl font-bold text-[#3B82F6]">{data.totals.listings}</p>
                  <p className="text-xs text-[#8B95A8] mt-1">Listings</p>
                </div>
                <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]">
                  <p className="text-3xl font-bold text-[#EC4899]">{data.totals.views.toLocaleString()}</p>
                  <p className="text-xs text-[#8B95A8] mt-1">Total Views</p>
                </div>
                <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]">
                  <p className="text-3xl font-bold text-[#10B981]">{data.totals.downloads.toLocaleString()}</p>
                  <p className="text-xs text-[#8B95A8] mt-1">Downloads</p>
                </div>
                <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]">
                  <p className="text-3xl font-bold text-[#F59E0B]">
                    {data.totals.views > 0 ? ((data.totals.downloads / data.totals.views) * 100).toFixed(1) : "0"}%
                  </p>
                  <p className="text-xs text-[#8B95A8] mt-1">Conversion</p>
                </div>
                <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151]">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-[#F59E0B]">{data.totals.avgRating.toFixed(1)}</p>
                    <StarRating rating={data.totals.avgRating} size={14} />
                  </div>
                  <p className="text-xs text-[#8B95A8] mt-1">{data.totals.reviews} Reviews</p>
                </div>
              </div>

              {/* Daily downloads chart */}
              <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151] mb-8">
                <h2 className="text-lg font-semibold text-[#E8EDF3] mb-4">Downloads (Last 30 Days)</h2>
                {data.downloadsPerDay.length > 0 ? (
                  <div className="flex items-end gap-1 h-40">
                    {data.downloadsPerDay.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-[#3B82F6] to-[#60A5FA] hover:opacity-80 transition-opacity"
                          style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: "2px" }}
                          title={`${d.count} downloads on ${new Date(d.date).toLocaleDateString()}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280] text-center py-8">No downloads yet.</p>
                )}
              </div>

              {/* Top listings */}
              <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
                <h2 className="text-lg font-semibold text-[#E8EDF3] mb-4">Your Top Listings</h2>
                {data.topListings.length > 0 ? (
                  <div className="space-y-3">
                    {data.topListings.map((l) => (
                      <div key={l.id} className="flex items-center justify-between py-3 border-b border-[#374151]/50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <Link href={`/exchange/${l.slug}`} className="text-sm font-medium text-[#E8EDF3] hover:text-[#3B82F6] truncate block">
                            {l.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-[#8B95A8] shrink-0">
                          <span><span className="text-[#EC4899] font-bold">{l.view_count}</span> views</span>
                          <span><span className="text-[#10B981] font-bold">{l.download_count}</span> downloads</span>
                          {l.rating_count > 0 && (
                            <span className="flex items-center gap-1">
                              <StarRating rating={l.rating_avg} size={12} />
                              ({l.rating_count})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280] text-center py-8">You have no published listings yet.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-[#8B95A8]">Failed to load analytics.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
