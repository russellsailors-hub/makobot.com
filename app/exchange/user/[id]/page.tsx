"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "../../../components";
import { ListingCard, StarRating } from "../../components";
import type { ExchangeListing } from "@/lib/exchange";

interface UserProfile {
  user: { id: number; name: string; username: string; display_name: string; avatar_url: string; bio: string; is_verified: boolean; created_at: string };
  listings: ExchangeListing[];
  stats: { totalListings: number; totalDownloads: number; avgRating: number; totalReviews: number };
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
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
          <Link href="/exchange" className="text-[#3B82F6] hover:text-[#60A5FA]">Back to Exchange</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { user, listings, stats } = profile;
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isOwnProfile = session?.user?.id === String(user.id);

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/exchange" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">Exchange</Link>
            <span className="text-[#4B5563]">/</span>
            <span className="text-[#E8EDF3] font-medium">@{user.username || "user"}</span>
          </div>

          {/* Profile Header */}
          <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151] mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-20 h-20 rounded-full border-2 border-[#3B82F6]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#374151] flex items-center justify-center text-[#6B7280] text-2xl font-bold border-2 border-[#3B82F6]">
                  {(user.username || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
                  <h1 className="text-2xl font-bold text-[#E8EDF3]">
                    {user.display_name || user.username || "User"}
                  </h1>
                  {user.is_verified && (
                    <span title="Verified Creator" className="inline-flex items-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#3B82F6">
                        <path d="M12 2L9.75 3.75 7.5 3 6 5l-2.25.75L3 8l1.5 1.5L3 11l.75 2.25L3 16l1.5 1.5L3 19l2.25.75L6 22l1.5-1.5L9 22l2.25-1.5L13.5 22 15 20.5l2.25.75L18 19l2.25-.75L21 16l-1.5-1.5L21 13l-.75-2.25L21 8l-2.25-.75L18 5l-1.5-1.5L15 4l-2.25-1.5L12 2zm-1.5 14.5L6 12l1.5-1.5L10.5 13.5 16.5 7.5 18 9l-7.5 7.5z" />
                      </svg>
                    </span>
                  )}
                  {isOwnProfile && (
                    <Link
                      href="/exchange/profile"
                      className="px-3 py-1 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold hover:bg-[#3B82F6]/20 transition-colors"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
                <p className="text-sm text-[#3B82F6] font-medium mb-2">@{user.username || "user"}</p>
                {user.bio && (
                  <p className="text-sm text-[#8B95A8] mb-3 leading-relaxed max-w-xl">{user.bio}</p>
                )}
                <p className="text-xs text-[#6B7280] mb-4">Member since {memberSince}</p>

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
              <p className="text-[#8B95A8]">No published listings yet.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
