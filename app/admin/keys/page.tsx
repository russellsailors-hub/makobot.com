"use client";

import { Fragment, useEffect, useState } from "react";

interface LicenseKey {
  id: number;
  key: string;
  tier: string;
  status: string;
  email: string;
  name: string;
  created_at: string;
  activated_at: string | null;
  last_download_version: string | null;
  last_download_at: string | null;
  download_count: number | string;
}

interface Download {
  id: number;
  version: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [expandedKeyId, setExpandedKeyId] = useState<number | null>(null);
  const [downloadsByKey, setDownloadsByKey] = useState<Record<number, Download[]>>({});
  const [downloadsLoading, setDownloadsLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/keys")
      .then((r) => r.json())
      .then((data) => setKeys(data.keys || []))
      .finally(() => setLoading(false));
  }, []);

  async function updateKey(keyId: number, field: "status" | "tier", value: string) {
    await fetch("/api/admin/keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId, [field]: value }),
    });
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, [field]: value } : k))
    );
  }

  async function toggleExpand(keyId: number) {
    if (expandedKeyId === keyId) {
      setExpandedKeyId(null);
      return;
    }
    setExpandedKeyId(keyId);
    if (!downloadsByKey[keyId]) {
      setDownloadsLoading((prev) => ({ ...prev, [keyId]: true }));
      try {
        const res = await fetch(`/api/admin/keys/${keyId}/downloads`);
        const data = await res.json();
        setDownloadsByKey((prev) => ({ ...prev, [keyId]: data.downloads || [] }));
      } finally {
        setDownloadsLoading((prev) => ({ ...prev, [keyId]: false }));
      }
    }
  }

  const filtered = keys.filter((k) => {
    if (filterStatus !== "all" && k.status !== filterStatus) return false;
    if (filterTier !== "all" && k.tier !== filterTier) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        k.key.toLowerCase().includes(s) ||
        k.email.toLowerCase().includes(s) ||
        k.name.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const statusCounts = {
    all: keys.length,
    active: keys.filter((k) => k.status === "active").length,
    revoked: keys.filter((k) => k.status === "revoked").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">License Keys</h1>
        <span className="text-sm text-[#8B95A8]">{keys.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search keys, emails, names..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-md bg-[#252B3B] border border-[#374151] rounded-lg px-4 py-3 text-sm text-[#E8EDF3] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6]"
        />

        <div className="flex gap-2">
          {(["all", "active", "revoked"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === s
                  ? "bg-[#3B82F6] text-white"
                  : "bg-[#252B3B] border border-[#374151] text-[#8B95A8] hover:text-[#E8EDF3]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
            </button>
          ))}
        </div>

        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="bg-[#252B3B] border border-[#374151] rounded-lg px-4 py-2 text-sm text-[#E8EDF3] focus:outline-none focus:border-[#3B82F6]"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {loading ? (
        <p className="text-[#8B95A8]">Loading keys...</p>
      ) : (
        <div className="bg-[#252B3B] rounded-xl border border-[#374151] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1E2330] text-[#8B95A8] text-xs uppercase tracking-wider">
                  <th className="w-8 px-2 py-3"></th>
                  <th className="text-left px-4 py-3 font-medium">Key</th>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-center px-4 py-3 font-medium">Tier</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Last Download</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  <th className="text-center px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => {
                  const isExpanded = expandedKeyId === k.id;
                  const downloads = downloadsByKey[k.id];
                  const loadingRow = downloadsLoading[k.id];
                  const totalDownloads = Number(k.download_count ?? 0);
                  return (
                    <Fragment key={k.id}>
                      <tr
                        className={`border-t border-[#374151]/50 hover:bg-[#374151]/20 ${
                          isExpanded ? "bg-[#374151]/10" : ""
                        }`}
                      >
                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() => toggleExpand(k.id)}
                            aria-label={isExpanded ? "Collapse downloads" : "Expand downloads"}
                            className="w-6 h-6 inline-flex items-center justify-center rounded text-[#8B95A8] hover:text-[#3B82F6] hover:bg-[#374151]/50 transition-colors"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-[#3B82F6] font-mono text-xs">{k.key}</code>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#E8EDF3] text-sm">{k.name || "—"}</p>
                          <p className="text-[#6B7280] text-xs">{k.email}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={k.tier}
                            onChange={(e) => updateKey(k.id, "tier", e.target.value)}
                            className="bg-[#1E2330] border border-[#374151] rounded px-2 py-1 text-xs text-[#E8EDF3] focus:outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              k.status === "active"
                                ? "bg-[#10B981]/20 text-[#10B981]"
                                : "bg-[#DC2626]/20 text-[#DC2626]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                k.status === "active" ? "bg-[#10B981]" : "bg-[#DC2626]"
                              }`}
                            />
                            {k.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {k.last_download_version ? (
                            <div>
                              <p className="text-[#E8EDF3] text-xs font-medium">{k.last_download_version}</p>
                              <p className="text-[#6B7280] text-xs">
                                {k.last_download_at ? new Date(k.last_download_at).toLocaleString() : ""}
                                {totalDownloads > 1 && (
                                  <span className="ml-2 text-[#3B82F6]">· {totalDownloads} total</span>
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[#6B7280] text-xs">Never</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#6B7280] text-xs">
                          {new Date(k.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {k.status === "active" ? (
                            <button
                              onClick={() => updateKey(k.id, "status", "revoked")}
                              className="px-3 py-1 rounded text-xs bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 transition-colors"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => updateKey(k.id, "status", "active")}
                              className="px-3 py-1 rounded text-xs bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#1E2330]/60">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="ml-8">
                              <h4 className="text-xs uppercase tracking-wider text-[#8B95A8] font-medium mb-3">
                                Download History · {k.email}
                              </h4>
                              {loadingRow ? (
                                <p className="text-[#8B95A8] text-sm">Loading downloads…</p>
                              ) : !downloads || downloads.length === 0 ? (
                                <p className="text-[#6B7280] text-sm">No downloads yet.</p>
                              ) : (
                                <div className="rounded-lg border border-[#374151]/70 overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-[#252B3B] text-[#8B95A8]">
                                        <th className="text-left px-3 py-2 font-medium">Version</th>
                                        <th className="text-left px-3 py-2 font-medium">Date</th>
                                        <th className="text-left px-3 py-2 font-medium">IP</th>
                                        <th className="text-left px-3 py-2 font-medium">User Agent</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {downloads.map((d) => (
                                        <tr key={d.id} className="border-t border-[#374151]/50">
                                          <td className="px-3 py-2 text-[#E8EDF3] font-medium">
                                            {d.version || "—"}
                                          </td>
                                          <td className="px-3 py-2 text-[#8B95A8]">
                                            {new Date(d.created_at).toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2 text-[#6B7280] font-mono">
                                            {d.ip || "—"}
                                          </td>
                                          <td className="px-3 py-2 text-[#6B7280] max-w-md truncate" title={d.user_agent || ""}>
                                            {d.user_agent || "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#6B7280]">
                      {search || filterStatus !== "all" ? "No keys match your filters" : "No keys issued yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
