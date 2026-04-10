"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "../../../components";
import { ListingCard, StarRating } from "../../components";
import type { ExchangeListing } from "@/lib/exchange";

interface UserProfile {
  user: { id: number; name: string; avatar_url: string; created_at: string };
  listings: ExchangeListing[];
  stats: { totalListings: number; totalDownloads: number; avgRating: number; totalReviews: number };
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/exchange/user/${id}`);
        if (res.ok) setProfile(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-6xl mx-auto">
          <div className="animate-pulse flex gap-6 items-center mb-12">
            <div className="w-20 h-20 bg-[#374151] rounded-full" />
            <div>
              <div className="h-6 bg-[#374151] rounded w-48 mb-2" />
              <div className="h-4 bg-[#374151] rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#E8EDF3] mb-4">User not found</h1>
          <Link href="/exchange" className="text-[#3B82F6] hover:text-[#2563EB]">Back to Exchange</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { user, listings, stats } = profile;
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8">
            <Link href="/exchange" className="hover:text-[#3B82F6] transition-colors">Exchange</Link>
            <span>/</span>
            <span className="text-[#8B95A8]">{user.name}</span>
          </div>

          {/* Profile Header */}
          <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151] mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="w-20 h-20 rounded-full border-2 border-[#3B82F6]" />
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-[#E8EDF3] mb-1">{user.name}</h1>
                <p className="text-sm text-[#6B7280] mb-4">Member since {memberSince}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                  <div>
                    <p className="text-2xl font-bold text-[#3B82F6]">{stats.totalListings}</p>
                    <p className="text-xs text-[#8B95A8]">Listings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#10B981]">{stats.totalDownloads}</p>
                    <p className="text-xs text-[#8B95A8]">Downloads</p>
                  </div>
                  {stats.totalReviews > 0 && (
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold text-[#F59E0B]">{stats.avgRating.toFixed(1)}</p>
                        <StarRating rating={stats.avgRating} size={16} />
                      </div>
                      <p className="text-xs text-[#8B95A8]">{stats.totalReviews} Reviews</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <h2 className="text-xl font-bold text-[#E8EDF3] mb-6">
            Published Listings ({listings.length})
          </h2>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#252B3B] rounded-xl border border-[#374151]">
              <p className="text-[#8B95A8]">This user has not published any listings yet.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
