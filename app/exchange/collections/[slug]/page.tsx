"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "../../../components";
import { ListingCard } from "../../components";
import type { ExchangeListing } from "@/lib/exchange";

interface CollectionDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  author_name: string;
  author_avatar: string;
  user_id: number;
  created_at: string;
  items: ExchangeListing[];
}

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/exchange/collections/${slug}`)
      .then((r) => r.json())
      .then((data) => setCollection(data.collection || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-[#374151] rounded w-1/3 mb-4" />
          <div className="h-4 bg-[#374151] rounded w-2/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-[#374151] rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#E8EDF3] mb-4">Collection not found</h1>
          <Link href="/exchange/collections" className="text-[#3B82F6]">Back to Collections</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
            <Link href="/exchange" className="hover:text-[#3B82F6]">Exchange</Link>
            <span>/</span>
            <Link href="/exchange/collections" className="hover:text-[#3B82F6]">Collections</Link>
            <span>/</span>
            <span className="text-[#8B95A8]">{collection.title}</span>
          </div>

          <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151] mb-8">
            <h1 className="text-2xl font-bold text-[#E8EDF3] mb-2">{collection.title}</h1>
            <p className="text-sm text-[#8B95A8] mb-4">{collection.description}</p>
            <div className="flex items-center gap-4 text-xs text-[#6B7280]">
              <Link href={`/exchange/user/${collection.user_id}`} className="flex items-center gap-2 hover:text-[#3B82F6]">
                {collection.author_avatar && <img src={collection.author_avatar} alt="" className="w-5 h-5 rounded-full" />}
                {collection.author_name}
              </Link>
              <span>{collection.items.length} items</span>
              <span>{new Date(collection.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {collection.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {collection.items.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#252B3B] rounded-xl border border-[#374151]">
              <p className="text-[#8B95A8]">This collection is empty.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
