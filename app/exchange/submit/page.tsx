"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nav, Footer } from "../../components";
import { CATEGORIES, PLATFORMS } from "@/lib/exchange";

export default function SubmitPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function togglePlatform(value: string) {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !category || platforms.length === 0) {
      setError("Please fill in all required fields and select at least one platform.");
      return;
    }

    if (!content.trim() && !file) {
      setError("Please add content (paste text) or upload a file.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("description", description.trim());
      formData.set("category", category);
      formData.set("platforms", JSON.stringify(platforms));
      if (content.trim()) formData.set("content", content.trim());
      if (file) formData.set("file", file);

      const res = await fetch("/api/exchange/listings", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push("/exchange/my-listings");
    } catch {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="pt-28 px-6 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#E8EDF3] mb-4">
            Sign in to submit
          </h1>
          <p className="text-[#8B95A8] mb-6">
            You need to be signed in to submit a listing to the exchange.
          </p>
          <Link
            href="/get-key"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold transition-colors"
          >
            Sign In with Google
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
            <Link href="/exchange" className="hover:text-[#3B82F6] transition-colors">
              Exchange
            </Link>
            <span>/</span>
            <span className="text-[#8B95A8]">Submit</span>
          </div>

          <h1 className="text-3xl font-bold text-[#E8EDF3] mb-2">
            Submit a Listing
          </h1>
          <p className="text-[#8B95A8] mb-8">
            Share your AI skills, prompts, configs, or tools with the community.
            Submissions are reviewed before going live.
          </p>

          {error && (
            <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] rounded-lg px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="My Awesome Claude Config"
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
              <p className="text-xs text-[#6B7280] mt-1">{title.length}/200</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — {c.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">
                Platforms *
              </label>
              <p className="text-xs text-[#6B7280] mb-3">
                Select all platforms this works with.
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => togglePlatform(p.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      platforms.includes(p.value)
                        ? "text-white"
                        : "bg-[#252B3B] text-[#8B95A8] border border-[#374151] hover:text-[#E8EDF3]"
                    }`}
                    style={
                      platforms.includes(p.value)
                        ? { backgroundColor: p.color }
                        : undefined
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="What does this do? How should someone use it? What problem does it solve?"
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
              />
              <p className="text-xs text-[#6B7280] mt-1">
                {description.length}/5000
              </p>
            </div>

            {/* Content (paste) */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">
                Content (paste the text)
              </label>
              <p className="text-xs text-[#6B7280] mb-2">
                For prompts, configs, or any text-based content. Paste it here
                so others can preview it before downloading.
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Paste your skill content, prompt, config, etc..."
                className="w-full px-4 py-3 rounded-lg bg-[#1E2330] border border-[#374151] text-[#C0C8D8] text-sm font-mono placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">
                Or upload a file (max 500KB)
              </label>
              <p className="text-xs text-[#6B7280] mb-2">
                For .skill files, JSON configs, or anything that is better as a
                downloadable file.
              </p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block text-sm text-[#8B95A8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#3B82F6] file:text-white hover:file:bg-[#2563EB] file:cursor-pointer"
              />
              {file && (
                <p className="text-xs text-[#6B7280] mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)}KB)
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold text-base transition-colors"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>
              <p className="text-xs text-[#6B7280] mt-3 text-center">
                Your submission will be reviewed by an admin before appearing on
                the exchange.
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
