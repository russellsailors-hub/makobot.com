"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "../../components";
import { PlatformPills } from "../components";
import { getCategoryLabel } from "@/lib/exchange";

interface SkillRequest {
  id: number;
  title: string;
  description: string;
  category: string | null;
  platforms: string[];
  upvote_count: number;
  author_name: string;
  author_avatar: string;
  created_at: string;
}

export default function RequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<SkillRequest[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("most-upvoted");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await fetch(`/api/exchange/requests?sort=${sort}`);
      const data = await res.json();
      setRequests(data.requests || []);
      setUserUpvotes(data.userUpvotes || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadRequests(); }, [sort]);

  async function handleUpvote(id: number) {
    if (!session?.user) return;
    try {
      const res = await fetch(`/api/exchange/requests/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.upvoted) {
        setUserUpvotes((prev) => [...prev, id]);
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, upvote_count: r.upvote_count + 1 } : r));
      } else {
        setUserUpvotes((prev) => prev.filter((i) => i !== id));
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, upvote_count: r.upvote_count - 1 } : r));
      }
    } catch {}
  }

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/exchange/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setShowForm(false);
        loadRequests();
      }
    } catch {}
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[#E8EDF3]">Skill Requests</h1>
            {session?.user && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
              >
                {showForm ? "Cancel" : "Request a Skill"}
              </button>
            )}
          </div>
          <p className="text-[#8B95A8] mb-6">
            Looking for something that does not exist yet? Request it here and the community can build it.
            Upvote requests you want to see built.
          </p>

          {/* Submit form */}
          {showForm && (
            <form onSubmit={handleSubmitRequest} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E8EDF3] mb-1">What do you need? *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
                  placeholder="A skill that generates database migrations from plain English"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E8EDF3] mb-1">Details *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000}
                  placeholder="Describe what this skill should do, what platforms it should work with, and any specific requirements."
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          )}

          {/* Sort */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setSort("most-upvoted")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sort === "most-upvoted" ? "bg-[#3B82F6] text-white" : "bg-[#252B3B] text-[#8B95A8] border border-[#374151]"}`}>
              Most Wanted
            </button>
            <button onClick={() => setSort("newest")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sort === "newest" ? "bg-[#3B82F6] text-white" : "bg-[#252B3B] text-[#8B95A8] border border-[#374151]"}`}>
              Newest
            </button>
          </div>

          {/* Request list */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] animate-pulse">
                  <div className="h-5 bg-[#374151] rounded w-2/3 mb-3" />
                  <div className="h-4 bg-[#374151] rounded w-full" />
                </div>
              ))}
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req) => {
                const isUpvoted = userUpvotes.includes(req.id);
                return (
                  <div key={req.id} className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] flex gap-4">
                    {/* Upvote button */}
                    <button
                      onClick={() => handleUpvote(req.id)}
                      disabled={!session?.user}
                      className={`flex flex-col items-center shrink-0 px-3 py-2 rounded-lg transition-colors ${
                        isUpvoted
                          ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                          : "bg-[#1E2330] text-[#6B7280] hover:text-[#E8EDF3]"
                      } ${!session?.user ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      <span className="text-sm font-bold mt-1">{req.upvote_count}</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#E8EDF3] mb-1">{req.title}</h3>
                      <p className="text-sm text-[#8B95A8] mb-3 leading-relaxed">{req.description}</p>
                      <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                        <div className="flex items-center gap-1.5">
                          {req.author_avatar && <img src={req.author_avatar} alt="" className="w-4 h-4 rounded-full" />}
                          {req.author_name}
                        </div>
                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                        {req.category && <span>{getCategoryLabel(req.category)}</span>}
                      </div>
                      {req.platforms.length > 0 && (
                        <div className="mt-2">
                          <PlatformPills platforms={req.platforms} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#8B95A8] text-lg mb-2">No requests yet.</p>
              <p className="text-[#6B7280] text-sm">Be the first to request a skill the community should build.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
