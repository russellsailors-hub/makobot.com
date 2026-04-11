"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type Source = "github" | "gists";

interface LogEntry {
  type: string;
  message?: string;
  title?: string;
  author?: string;
  imported?: number;
  skipped?: number;
  errors?: number;
  total?: number;
}

const SOURCES: { value: Source; label: string; endpoint: string; color: string; icon: string }[] = [
  {
    value: "github",
    label: "GitHub Repos",
    endpoint: "/api/admin/exchange/scrape",
    color: "#E8EDF3",
    icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
  },
  {
    value: "gists",
    label: "GitHub Gists",
    endpoint: "/api/admin/exchange/scrape-gists",
    color: "#F59E0B",
    icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
  },
];

export default function ScrapePage() {
  const [source, setSource] = useState<Source>("github");
  const [maxResults, setMaxResults] = useState(50);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState({ imported: 0, skipped: 0, errors: 0, total: 0 });
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const currentSource = SOURCES.find((s) => s.value === source)!;

  async function startScrape() {
    setRunning(true);
    setDone(false);
    setLog([]);
    setProgress({ imported: 0, skipped: 0, errors: 0, total: maxResults });

    try {
      const res = await fetch(currentSource.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxResults }),
      });

      if (!res.ok || !res.body) {
        setLog([{ type: "error", message: "Failed to start scrape" }]);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as LogEntry;
            setLog((prev) => [...prev, data]);

            if (data.imported !== undefined) {
              setProgress((prev) => ({
                ...prev,
                imported: data.imported || 0,
                skipped: data.skipped || 0,
                errors: data.errors || 0,
              }));
            }

            if (data.total) {
              setProgress((prev) => ({ ...prev, total: data.total || prev.total }));
            }

            if (data.type === "done") {
              setDone(true);
            }

            setTimeout(() => {
              if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
            }, 50);
          } catch { /* skip bad JSON */ }
        }
      }
    } catch {
      setLog((prev) => [...prev, { type: "error", message: "Connection lost" }]);
    }

    setRunning(false);
  }

  const pct = progress.total > 0 ? Math.round((progress.imported / progress.total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
        <Link href="/admin/exchange" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium">Exchange</Link>
        <span>/</span>
        <span className="text-[#E8EDF3] font-medium">Scraper</span>
      </div>

      <h1 className="text-2xl font-bold text-[#E8EDF3] mb-2">Content Scraper</h1>
      <p className="text-[#8B95A8] mb-8">
        Import public AI configuration files from GitHub, Gists, and GitLab.
        Original authors are credited and can claim their listings via GitHub OAuth.
      </p>

      {/* Source tabs */}
      <div className="flex gap-2 mb-6">
        {SOURCES.map((s) => (
          <button
            key={s.value}
            onClick={() => !running && setSource(s.value)}
            disabled={running}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
              source === s.value
                ? "border-current bg-current/10"
                : "border-[#374151] bg-[#252B3B] text-[#8B95A8] hover:text-[#E8EDF3]"
            } ${running ? "opacity-50 cursor-not-allowed" : ""}`}
            style={source === s.value ? { color: s.color, borderColor: s.color } : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={source === s.value ? s.color : "#8B95A8"}>
              <path d={s.icon} />
            </svg>
            {s.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-[#E8EDF3] mb-2">Max listings to import</label>
            <input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Math.max(10, Math.min(300, parseInt(e.target.value) || 50)))}
              min={10}
              max={300}
              disabled={running}
              className="w-32 px-4 py-2.5 rounded-lg bg-[#1E2330] border border-[#374151] text-[#E8EDF3] text-sm focus:outline-none focus:border-[#3B82F6]"
            />
            <p className="text-xs text-[#6B7280] mt-1">10 to 300</p>
          </div>
          <button
            onClick={startScrape}
            disabled={running}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: currentSource.color === "#E8EDF3" ? "#374151" : currentSource.color }}
          >
            {running ? `Scraping ${currentSource.label}...` : `Scrape ${currentSource.label}`}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {(running || done) && (
        <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#E8EDF3]">
              {done ? "Scrape Complete" : `Scraping ${currentSource.label}...`}
            </span>
            <span className="text-sm text-[#8B95A8]">{pct}%</span>
          </div>

          <div className="w-full h-3 bg-[#1E2330] rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: done ? "#10B981" : `linear-gradient(90deg, ${currentSource.color}, ${currentSource.color}88)`,
              }}
            />
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-[#10B981] font-bold">{progress.imported}</span>
              <span className="text-[#8B95A8] ml-1">Imported</span>
            </div>
            <div>
              <span className="text-[#F59E0B] font-bold">{progress.skipped}</span>
              <span className="text-[#8B95A8] ml-1">Skipped</span>
            </div>
            <div>
              <span className="text-[#DC2626] font-bold">{progress.errors}</span>
              <span className="text-[#8B95A8] ml-1">Errors</span>
            </div>
          </div>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-[#1E2330] rounded-xl border border-[#374151] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#374151] flex items-center justify-between">
            <span className="text-sm font-medium text-[#E8EDF3]">Activity Log</span>
            <span className="text-xs text-[#6B7280]">{log.length} entries</span>
          </div>
          <div
            ref={logRef}
            className="max-h-[400px] overflow-y-auto styled-scrollbar p-4 space-y-1 font-mono text-xs"
          >
            {log.map((entry, i) => (
              <div
                key={i}
                className={
                  entry.type === "error" || entry.type === "warning"
                    ? "text-[#F59E0B]"
                    : entry.type === "imported"
                    ? "text-[#10B981]"
                    : entry.type === "done"
                    ? "text-[#3B82F6] font-bold"
                    : "text-[#6B7280]"
                }
              >
                {entry.type === "imported" ? (
                  <>+ {entry.title} <span className="text-[#6B7280]">by @{entry.author}</span></>
                ) : (
                  entry.message || JSON.stringify(entry)
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
