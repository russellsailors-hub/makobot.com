"use client";

import { useState, useRef } from "react";
import Link from "next/link";

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

export default function ScrapePage() {
  const [maxResults, setMaxResults] = useState(50);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState({ imported: 0, skipped: 0, errors: 0, total: 0 });
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  async function startScrape() {
    setRunning(true);
    setDone(false);
    setLog([]);
    setProgress({ imported: 0, skipped: 0, errors: 0, total: maxResults });

    try {
      const res = await fetch("/api/admin/exchange/scrape", {
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

            // Auto-scroll log
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
        <span className="text-[#E8EDF3] font-medium">GitHub Scraper</span>
      </div>

      <h1 className="text-2xl font-bold text-[#E8EDF3] mb-2">GitHub Scraper</h1>
      <p className="text-[#8B95A8] mb-8">
        Import public AI configuration files from GitHub. Searches for CLAUDE.md, .cursorrules,
        .windsurfrules, MCP configs, skills, and prompts. Original authors are credited with a
        link to their GitHub profile.
      </p>

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
            className="px-6 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {running ? "Scraping..." : "Start Scrape"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {(running || done) && (
        <div className="bg-[#252B3B] rounded-xl p-5 border border-[#374151] mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#E8EDF3]">
              {done ? "Scrape Complete" : "Scraping..."}
            </span>
            <span className="text-sm text-[#8B95A8]">{pct}%</span>
          </div>

          {/* Bar */}
          <div className="w-full h-3 bg-[#1E2330] rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: done ? "#10B981" : "linear-gradient(90deg, #3B82F6, #60A5FA)",
              }}
            />
          </div>

          {/* Stats */}
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
