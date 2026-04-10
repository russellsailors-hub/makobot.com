"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Logo, Nav, Footer } from "../components";
import {
  CategoryTabs,
  PlatformFilter,
  SearchBar,
  SortSelect,
  ListingCard,
  ExchangeEmpty,
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

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (platform) params.set("platform", platform);
      if (search.trim()) params.set("search", search.trim());
      params.set("sort", sort);

      const res = await fetch(`/api/exchange/listings?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      setListings([]);
    }
    setLoading(false);
  }, [category, platform, search, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchListings, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchListings, search]);

  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-6">
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
          <p className="text-lg text-[#8B95A8] max-w-2xl mx-auto mb-8">
            Browse, share, and download AI skills, prompts, configs, and tools
            across every platform. The universal hub for AI productivity.
          </p>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
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
