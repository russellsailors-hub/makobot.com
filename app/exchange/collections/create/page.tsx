"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Footer } from "../../../components";

export default function CreateCollectionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { setError("Title and description required."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/exchange/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/exchange/collections/${data.collection.slug}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create.");
        setSubmitting(false);
      }
    } catch {
      setError("Failed to create collection.");
      setSubmitting(false);
    }
  }

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

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#E8EDF3] mb-2">Create a Collection</h1>
          <p className="text-[#8B95A8] mb-8">
            Bundle your favorite skills, configs, and tools into a curated collection others can discover.
          </p>

          {error && (
            <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] rounded-lg px-4 py-3 text-sm mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">Collection Name *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
                placeholder="My Full-Stack Dev Toolkit"
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000}
                placeholder="What is this collection about? Who is it for?"
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold transition-colors">
              {submitting ? "Creating..." : "Create Collection"}
            </button>
            <p className="text-xs text-[#6B7280] text-center">You can add listings to your collection after creating it.</p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
