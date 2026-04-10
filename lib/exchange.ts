// ─── AI SKILLS EXCHANGE — Constants, Types & Utilities ───

export const CATEGORIES = [
  { value: "skills", label: "Skills", description: "Claude Code .skill files, Cursor skills, Windsurf skills" },
  { value: "configs", label: "Global Configs", description: "CLAUDE.md, .cursorrules, .windsurfrules, custom instructions" },
  { value: "mcp", label: "MCP Servers", description: "MCP server configs and listings" },
  { value: "prompts", label: "Prompts", description: "Reusable prompts for any AI tool" },
  { value: "hooks", label: "Hooks & Automations", description: "Claude Code hooks, Cursor workflows, IDE integrations" },
  { value: "agents", label: "Agents", description: "Agent SDK configs, LangChain, CrewAI setups" },
] as const;

export const PLATFORMS = [
  { value: "claude", label: "Claude", color: "#3B82F6" },
  { value: "chatgpt", label: "ChatGPT", color: "#6366F1" },
  { value: "gemini", label: "Gemini", color: "#EC4899" },
  { value: "cursor", label: "Cursor", color: "#F59E0B" },
  { value: "windsurf", label: "Windsurf", color: "#10B981" },
  { value: "copilot", label: "Copilot", color: "#8B5CF6" },
  { value: "midjourney", label: "Midjourney", color: "#06B6D4" },
  { value: "stable-diffusion", label: "Stable Diffusion", color: "#F97316" },
  { value: "universal", label: "Universal", color: "#6B7280" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
export type PlatformValue = (typeof PLATFORMS)[number]["value"];

export interface ExchangeListing {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  description: string;
  category: CategoryValue;
  platforms: PlatformValue[];
  content: string | null;
  file_name: string | null;
  file_size: number;
  screenshot_url: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  download_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  // Joined from users table
  author_name?: string;
  author_avatar?: string;
  author_email?: string;
}

export interface ExchangeReview {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export function generateSlug(title: string, id: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "listing"}-${id}`;
}

export function getPlatformColor(platform: string): string {
  return PLATFORMS.find((p) => p.value === platform)?.color || "#6B7280";
}

export function getPlatformLabel(platform: string): string {
  return PLATFORMS.find((p) => p.value === platform)?.label || platform;
}

export function getCategoryLabel(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.label || category;
}

export const MAX_FILE_SIZE = 500 * 1024; // 500KB
export const MAX_CONTENT_LENGTH = 500000; // ~500KB of text
