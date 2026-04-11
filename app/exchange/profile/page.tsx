"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "../../components";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);

  useEffect(() => {
    fetch("/api/exchange/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUsername(data.user.username || "");
          setDisplayName(data.user.display_name || "");
          setBio(data.user.bio || "");
          setAvatarUrl(data.user.avatar_url || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!username.trim()) { setError("Username is required."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/exchange/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); }
      else { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
    } catch { setError("Failed to save. Please try again."); }
    setSaving(false);
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 px-6 max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#374151] rounded w-1/3" />
            <div className="h-10 bg-[#374151] rounded" />
            <div className="h-10 bg-[#374151] rounded" />
            <div className="h-24 bg-[#374151] rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/exchange" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">Exchange</Link>
            <span className="text-[#4B5563]">/</span>
            <span className="text-[#E8EDF3] font-medium">Edit Profile</span>
          </div>

          <h1 className="text-3xl font-bold text-[#E8EDF3] mb-2">Edit Profile</h1>
          <p className="text-[#8B95A8] mb-8">This is how you appear across the exchange.</p>

          {error && (
            <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] rounded-lg px-4 py-3 text-sm mb-6">{error}</div>
          )}
          {success && (
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-lg px-4 py-3 text-sm mb-6">Profile saved.</div>
          )}

          {/* Avatar + identity */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setEditingAvatar(!editingAvatar)}
              className="relative group shrink-0"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full border-2 border-[#3B82F6] group-hover:opacity-70 transition-opacity" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#374151] flex items-center justify-center text-[#6B7280] text-2xl font-bold border-2 border-[#3B82F6] group-hover:opacity-70 transition-opacity">
                  {(username || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>
            <div>
              <p className="text-lg font-semibold text-[#E8EDF3]">{displayName || username}</p>
              <p className="text-sm text-[#3B82F6]">@{username || "username"}</p>
              <p className="text-xs text-[#6B7280] mt-1">Click avatar to change</p>
            </div>
          </div>

          {/* Avatar URL input (shown on click) */}
          {editingAvatar && (
            <div className="bg-[#252B3B] rounded-xl p-4 border border-[#374151] mb-6">
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://i.imgur.com/your-photo.jpg"
                className="w-full px-4 py-3 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
              <p className="text-xs text-[#6B7280] mt-2">Paste a URL to any image. Your Google photo is used by default.</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">Username *</label>
              <div className="flex items-center">
                <span className="px-3 py-3 rounded-l-lg bg-[#1E2330] border border-r-0 border-[#374151] text-[#6B7280] text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  maxLength={30}
                  placeholder="your-username"
                  className="flex-1 px-4 py-3 rounded-r-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
              <p className="text-xs text-[#6B7280] mt-1">Letters, numbers, hyphens, underscores. 3-30 characters.</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="How you want your name displayed"
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#E8EDF3] mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Tell the community about yourself..."
                className="w-full px-4 py-3 rounded-lg bg-[#252B3B] border border-[#374151] text-[#E8EDF3] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
              />
              <p className="text-xs text-[#6B7280] mt-1">{bio.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold text-base transition-colors"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
