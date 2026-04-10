"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Footer } from "../../components";
import { CATEGORIES, PLATFORMS } from "@/lib/exchange";

function SubmitForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRemix, setIsRemix] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [importing, setImporting] = useState(false);

  // Pre-fill from remix query params
  useEffect(() => {
    const remixId = searchParams.get("remix");
    if (remixId) {
      setIsRemix(true);
      const t = searchParams.get("title");
      const c = searchParams.get("category");
      const p = searchParams.get("platforms");
      if (t) setTitle(t);
      if (c) setCategory(c);
      if (p) { try { setPlatforms(JSON.parse(p)); } catch {} }
      // Fetch original content for remixing
      fetch(`/api/exchange/my-listings`)
        .catch(() => {});
    }
  }, [searchParams]);

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
      if (screenshotUrl.trim()) formData.set("screenshot_url", screenshotUrl.trim());
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
        <div className="pt-8 px-6 max-w-2xl mx-auto text-center">
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
      <div className="pt-8 pb-20 px-6">
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

          {/* GitHub Import */}
          <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] mb-8">
            <h3 className="text-sm font-semibold text-[#E8EDF3] mb-3 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Import from GitHub
            </h3>
            <p className="text-xs text-[#6B7280] mb-3">
              Paste a link to a file on GitHub and we will auto-fill the form for you.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/user/repo/blob/main/CLAUDE.md"
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
              <button
                type="button"
                disabled={!githubUrl.trim() || importing}
                onClick={async () => {
                  setImporting(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/exchange/import-github", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: githubUrl }),
                    });
                    const data = await res.json();
                    if (!res.ok) { setError(data.error); setImporting(false); return; }
                    if (data.suggestedTitle) setTitle(data.suggestedTitle);
                    if (data.suggestedDescription) setDescription(data.suggestedDescription);
                    if (data.suggestedCategory) setCategory(data.suggestedCategory);
                    if (data.suggestedPlatforms) setPlatforms(data.suggestedPlatforms);
                    if (data.content) setContent(data.content);
                  } catch { setError("Failed to import from GitHub."); }
                  setImporting(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-semibold transition-colors shrink-0"
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>

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

            {/* Screenshot URL */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">
                Screenshot or preview image URL (optional)
              </label>
              <p className="text-xs text-[#6B7280] mb-2">
                Paste a URL to a screenshot showing your skill, prompt, or config in action.
                Use any image hosting service (Imgur, GitHub, etc.).
              </p>
              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://i.imgur.com/example.png"
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
              {screenshotUrl && (
                <div className="mt-3">
                  <img
                    src={screenshotUrl}
                    alt="Preview"
                    className="max-h-48 rounded-lg border border-[#374151]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>

            {/* Remix notice */}
            {isRemix && (
              <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg px-4 py-3 text-sm text-[#8B5CF6]">
                This is a remix. The original author will be credited automatically.
              </div>
            )}

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

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitForm />
    </Suspense>
  );
}
