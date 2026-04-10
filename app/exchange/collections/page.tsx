"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "../../components";

interface Collection {
  id: number;
  title: string;
  slug: string;
  description: string;
  author_name: string;
  author_avatar: string;
  item_count: number;
  created_at: string;
}

export default function CollectionsPage() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange/collections")
      .then((r) => r.json())
      .then((data) => setCollections(data.collections || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#E8EDF3]">Collections</h1>
              <p className="text-[#8B95A8] mt-1">Curated bundles of skills, configs, and tools</p>
            </div>
            {session?.user && (
              <Link
                href="/exchange/collections/create"
                className="inline-flex items-center px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
              >
                <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Collection
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] animate-pulse">
                  <div className="h-5 bg-[#374151] rounded w-2/3 mb-3" />
                  <div className="h-4 bg-[#374151] rounded w-full mb-2" />
                  <div className="h-4 bg-[#374151] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {collections.map((c) => (
                <Link
                  key={c.id}
                  href={`/exchange/collections/${c.slug}`}
                  className="block bg-[#252B3B] rounded-xl p-5 border border-[#374151] feature-card"
                >
                  <h3 className="text-base font-semibold text-[#E8EDF3] mb-2">{c.title}</h3>
                  <p className="text-sm text-[#8B95A8] mb-4 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <div className="flex items-center gap-2">
                      {c.author_avatar && <img src={c.author_avatar} alt="" className="w-5 h-5 rounded-full" />}
                      <span>{c.author_name}</span>
                    </div>
                    <span>{c.item_count} items</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#8B95A8] text-lg mb-2">No collections yet.</p>
              <p className="text-[#6B7280] text-sm">
                Be the first to curate a collection of your favorite AI tools.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
