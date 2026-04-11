"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Logo, Footer } from "../components";
import {
  CategoryTabs,
  PlatformFilter,
  SearchBar,
  SortSelect,
  ListingCard,
  ExchangeEmpty,
  TrendingSection,
} from "./components";
import type { ExchangeListing } from "@/lib/exchange";

export default function ExchangePage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<ExchangeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [trending, setTrending] = useState<ExchangeListing[]>([]);
  const [featured, setFeatured] = useState<ExchangeListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 21;

  // Load trending/featured once
  useEffect(() => {
    fetch("/api/exchange/trending")
      .then((r) => r.json())
      .then((data) => {
        setTrending(data.trending || []);
        setFeatured(data.featured || []);
      })
      .catch(() => {});
  }, []);

  const fetchListings = useCallback(async (pageNum = 0) => {
    setLoading(true);
    try {
      // Use semantic search when there's a query, regular endpoint otherwise
      if (search.trim().length >= 2) {
        const res = await fetch(`/api/exchange/semantic-search?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        const items = data.results || [];
        // Apply category/platform filters client-side on semantic results
        const filtered = items.filter((l: ExchangeListing) => {
          if (category && l.category !== category) return false;
          if (platform && !l.platforms.includes(platform as typeof l.platforms[number])) return false;
          return true;
        });
        setHasMore(false);
        setListings(filtered.slice(0, PAGE_SIZE));
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (platform) params.set("platform", platform);
      params.set("sort", sort);
      params.set("limit", String(PAGE_SIZE + 1));
      params.set("offset", String(pageNum * PAGE_SIZE));

      const res = await fetch(`/api/exchange/listings?${params}`);
      const data = await res.json();
      const items = data.listings || [];
      setHasMore(items.length > PAGE_SIZE);
      setListings(items.slice(0, PAGE_SIZE));
      if (data.totalCount !== undefined) setTotalCount(data.totalCount);
    } catch {
      setListings([]);
      setHasMore(false);
    }
    setLoading(false);
  }, [category, platform, search, sort]);

  useEffect(() => {
    setPage(0);
    const timeout = setTimeout(() => fetchListings(0), search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchListings, search]);

  function goToPage(p: number) {
    setPage(p);
    fetchListings(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-8 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Logo size={48} />
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#E8EDF3]">
                AI Skills Exchange
              </h1>
              <p className="text-sm text-[#8B95A8]">
                by MakoBot
              </p>
            </div>
          </div>
          <p className="text-lg text-[#8B95A8] max-w-2xl mx-auto mb-4">
            Browse, share, and download AI skills, prompts, configs, and tools
            across every platform. The universal hub for AI productivity.
          </p>
          {totalCount > 0 && (
            <p className="text-sm text-[#6B7280] mb-8">
              <span className="text-2xl font-bold text-[#EC4899]">{totalCount.toLocaleString()}</span>
              <span className="ml-2">listings and growing</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {session?.user ? (
              <Link
                href="/exchange/submit"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold transition-colors"
              >
                <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Submit a Listing
              </Link>
            ) : (
              <Link
                href="/get-key"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold transition-colors"
              >
                Sign In to Submit
              </Link>
            )}
            {session?.user && (
              <Link
                href="/exchange/my-listings"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-[#252B3B] hover:bg-[#2D3548] text-[#E8EDF3] font-semibold border border-[#374151] transition-colors"
              >
                My Listings
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trending + Featured */}
      {!search && !category && !platform && (
        <TrendingSection trending={trending} featured={featured} />
      )}

      {/* Divider */}
      {!search && !category && !platform && trending.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="border-t border-[#374151]/50" />
          <h2 className="text-lg font-bold text-[#E8EDF3] mt-6 mb-2">Browse All AI Skills, Prompts, and Configs</h2>
        </div>
      )}

      {/* Filters */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <SortSelect value={sort} onChange={setSort} />
          </div>

          {/* Category tabs */}
          <CategoryTabs selected={category} onChange={setCategory} />

          {/* Platform pills */}
          <PlatformFilter selected={platform} onChange={setPlatform} />
        </div>
      </section>

      {/* Listings Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] animate-pulse"
                >
                  <div className="h-3 bg-[#374151] rounded w-20 mb-4" />
                  <div className="h-5 bg-[#374151] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-[#374151] rounded w-full mb-1" />
                  <div className="h-4 bg-[#374151] rounded w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-[#374151] rounded-full w-16" />
                    <div className="h-5 bg-[#374151] rounded-full w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {(page > 0 || hasMore) && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 0}
                    className="px-5 py-2.5 rounded-lg bg-[#252B3B] border border-[#374151] text-sm font-medium text-[#E8EDF3] hover:bg-[#2D3548] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[#8B95A8]">
                    Page {page + 1}
                  </span>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={!hasMore}
                    className="px-5 py-2.5 rounded-lg bg-[#252B3B] border border-[#374151] text-sm font-medium text-[#E8EDF3] hover:bg-[#2D3548] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <ExchangeEmpty
              message={
                search || category || platform
                  ? "No listings match your filters."
                  : "No listings yet. Be the first to share something."
              }
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
