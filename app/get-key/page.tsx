"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Logo } from "../components";

export default function GetKeyPage() {
  const { data: session, status } = useSession();
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [tier, setTier] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchOrGenerateKey();
    }
  }, [session]);

  async function fetchOrGenerateKey() {
    setLoading(true);
    try {
      // Try to get existing key
      let res = await fetch("/api/keys");
      let data = await res.json();

      if (data.key) {
        setLicenseKey(data.key);
        setTier(data.tier);
      } else {
        // Generate new key
        res = await fetch("/api/keys", { method: "POST" });
        data = await res.json();
        setLicenseKey(data.key);
        setTier(data.tier);
      }
    } catch (err) {
      console.error("Failed to get key:", err);
    }
    setLoading(false);
  }

  async function copyKey() {
    if (!licenseKey) return;
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/download", { method: "POST" });
      const data = await res.json();
      if (data.url && data.url !== "#") {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[120px] pointer-events-none" />

      <Logo size={80} />
      <h1 className="text-3xl sm:text-4xl font-bold mt-8 mb-3 text-center">
        Get Your Free License Key
      </h1>
      <p className="text-[#8B95A8] text-center max-w-md mb-10">
        Sign in with Google to generate your personal MakoBot license key and download the app.
      </p>

      {status === "loading" ? (
        <div className="bg-[#252B3B] rounded-xl p-8 border border-[#374151] w-full max-w-md text-center">
          <p className="text-[#8B95A8]">Loading...</p>
        </div>
      ) : !session ? (
        /* ─── SIGN IN ─── */
        <div className="bg-[#252B3B] rounded-xl p-8 border border-[#374151] w-full max-w-md space-y-3">
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-white hover:bg-gray-100 text-gray-800 font-semibold text-base transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>
          <button
            onClick={() => signIn("github")}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-[#24292e] hover:bg-[#2f363d] text-white font-semibold text-base transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Sign in with GitHub
          </button>
          <p className="text-xs text-[#6B7280] text-center mt-4">
            We only use your email to generate your key. No spam, ever.
          </p>
        </div>
      ) : (
        /* ─── KEY + DOWNLOAD ─── */
        <div className="bg-[#252B3B] rounded-xl p-8 border border-[#374151] w-full max-w-lg">
          {/* User info */}
          <div className="flex items-center gap-3 mb-6">
            {session.user.image && (
              <img src={session.user.image} alt="" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="text-sm font-medium text-[#E8EDF3]">{session.user.name}</p>
              <p className="text-xs text-[#6B7280]">{session.user.email}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-[#8B95A8] text-center py-4">Generating your key...</p>
          ) : licenseKey ? (
            <>
              {/* License key display */}
              <div className="mb-6">
                <label className="text-xs text-[#8B95A8] uppercase tracking-wider mb-2 block">
                  Your License Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#1E2330] border border-[#374151] rounded-lg px-4 py-3 text-[#3B82F6] font-mono text-lg tracking-wider select-all">
                    {licenseKey}
                  </code>
                  <button
                    onClick={copyKey}
                    className="px-4 py-3 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-sm text-[#E8EDF3] transition-colors whitespace-nowrap"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mt-2">
                  Tier: <span className="text-[#10B981] font-medium capitalize">{tier}</span> — Paste this key into MakoBot on first launch.
                </p>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full px-6 py-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold text-lg transition-colors blue-glow"
              >
                {downloading ? "Starting download..." : "Download MakoBot Installer"}
              </button>
              <p className="text-xs text-[#6B7280] text-center mt-3">
                Windows 10/11 · Signed by Mako Logics LLC · ~53 MB · Includes installer
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 px-4 py-2 rounded-lg bg-[#1E2330] border border-[#374151]/50">
                <svg className="w-4 h-4 text-[#10B981] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-xs text-[#8B95A8]">Verified by <span className="text-[#E8EDF3] font-medium">Microsoft Azure Trusted Signing</span> — no SmartScreen warnings</span>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 rounded-lg bg-[#1E2330] border border-[#374151]">
                <p className="text-sm font-medium text-[#E8EDF3] mb-2">Quick Start:</p>
                <ol className="text-sm text-[#8B95A8] space-y-1 list-decimal list-inside">
                  <li>Extract the zip and run MakoBot-Setup.exe</li>
                  <li>Follow the installer (choose desktop shortcut, start with Windows)</li>
                  <li>Paste your license key when prompted</li>
                  <li>Add your project folders and you&apos;re done</li>
                </ol>
              </div>
            </>
          ) : (
            <p className="text-[#DC2626] text-center py-4">
              Something went wrong generating your key. Please refresh and try again.
            </p>
          )}
        </div>
      )}

      {/* Back to home */}
      <a href="/" className="mt-8 text-sm text-[#6B7280] hover:text-[#8B95A8] transition-colors">
        &larr; Back to makobot.com
      </a>
    </div>
  );
}
