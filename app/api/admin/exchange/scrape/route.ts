import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const SEARCH_QUERIES = [
  { q: "filename:CLAUDE.md path:/", cat: "configs", plat: ["claude"] },
  { q: "filename:.cursorrules", cat: "configs", plat: ["cursor"] },
  { q: "filename:.windsurfrules", cat: "configs", plat: ["windsurf"] },
  { q: "filename:SKILL.md path:/", cat: "skills", plat: ["claude"] },
  { q: "mcpServers extension:json", cat: "mcp", plat: ["claude", "universal"] },
  { q: "system prompt Claude filename:.md", cat: "prompts", plat: ["claude"] },
  { q: "system prompt ChatGPT filename:.md", cat: "prompts", plat: ["chatgpt"] },
  { q: "cursorrules react typescript", cat: "configs", plat: ["cursor"] },
  { q: "claude instructions AI assistant filename:.md", cat: "configs", plat: ["claude", "universal"] },
  { q: "custom instructions GPT filename:.md", cat: "configs", plat: ["chatgpt"] },
];

// POST /api/admin/exchange/scrape — Scrape GitHub for listings (admin only, streaming)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const body = await request.json();
  const maxResults = Math.min(body.maxResults || 50, 300);

  const sql = neon(process.env.DATABASE_URL!);

  // Get community user
  const communityUser = await sql`SELECT id FROM users WHERE email = 'community@makobot.com'`;
  if (communityUser.length === 0) {
    return new Response(JSON.stringify({ error: "Community user not found" }), { status: 500 });
  }
  const communityUserId = communityUser[0].id;

  // Stream progress
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      let imported = 0;
      let skipped = 0;
      let errors = 0;
      const perQuery = Math.ceil(maxResults / SEARCH_QUERIES.length);

      send({ type: "start", total: maxResults, message: "Starting GitHub scrape..." });

      for (const search of SEARCH_QUERIES) {
        if (imported >= maxResults) break;

        try {
          send({ type: "progress", imported, skipped, errors, message: `Searching: ${search.q.slice(0, 50)}...` });

          // GitHub Code Search API
          const res = await fetch(
            `https://api.github.com/search/code?q=${encodeURIComponent(search.q)}&per_page=${Math.min(perQuery, 30)}&sort=indexed&order=desc`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "MakoBot-Exchange-Scraper",
              },
            }
          );

          if (!res.ok) {
            const errText = await res.text();
            send({ type: "warning", message: `GitHub API error (${res.status}): ${errText.slice(0, 100)}` });
            // Rate limit -- wait and continue
            if (res.status === 403) {
              send({ type: "warning", message: "Rate limited. Waiting 10 seconds..." });
              await new Promise((r) => setTimeout(r, 10000));
            }
            errors++;
            continue;
          }

          const data = await res.json();
          const items = data.items || [];

          for (const item of items) {
            if (imported >= maxResults) break;

            try {
              const repoName = item.repository?.full_name;
              const filePath = item.path;
              const owner = item.repository?.owner?.login;
              const htmlUrl = item.html_url;

              if (!repoName || !filePath || !owner) { skipped++; continue; }

              // Check if we already have this source_url
              const existing = await sql`SELECT id FROM exchange_listings WHERE source_url = ${htmlUrl}`;
              if (existing.length > 0) { skipped++; continue; }

              // Fetch raw content
              const rawUrl = `https://raw.githubusercontent.com/${repoName}/${item.repository?.default_branch || "main"}/${filePath}`;
              const contentRes = await fetch(rawUrl);
              if (!contentRes.ok) { skipped++; continue; }

              const content = await contentRes.text();
              if (content.length < 50 || content.length > 500000) { skipped++; continue; }

              // Generate title from filename and repo
              let title = filePath.replace(/^.*\//, "").replace(/\.[^.]+$/, "");
              if (title === "CLAUDE" || title === ".cursorrules" || title === ".windsurfrules" || title === "SKILL") {
                title = `${title} from ${repoName.split("/")[1]}`;
              }
              title = title.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
              if (title.length > 190) title = title.slice(0, 190);

              // Generate description
              let description = `${getCategoryDescription(search.cat)} imported from ${repoName}. Original author: ${owner}.`;
              // Try to extract description from frontmatter
              const descMatch = content.match(/^---[\s\S]*?description:\s*(.+?)[\n\r]/m);
              if (descMatch) {
                description = descMatch[1].trim().slice(0, 500);
              }

              // Generate slug
              const slugBase = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);

              const result = await sql`
                INSERT INTO exchange_listings (user_id, title, slug, description, category, platforms, content, source_url, source_author, status)
                VALUES (${communityUserId}, ${title}, ${"temp-" + Date.now() + "-" + imported}, ${description}, ${search.cat}, ${search.plat}, ${content}, ${htmlUrl}, ${owner}, 'approved')
                RETURNING id
              `;
              const id = result[0].id;
              await sql`UPDATE exchange_listings SET slug = ${slugBase + "-" + id} WHERE id = ${id}`;

              imported++;
              send({ type: "imported", imported, skipped, errors, title, author: owner });
            } catch {
              errors++;
            }
          }

          // Small delay between queries to avoid rate limiting
          await new Promise((r) => setTimeout(r, 2000));
        } catch {
          errors++;
        }
      }

      send({ type: "done", imported, skipped, errors, message: `Scrape complete. ${imported} imported, ${skipped} skipped, ${errors} errors.` });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function getCategoryDescription(cat: string): string {
  const map: Record<string, string> = {
    configs: "AI configuration file",
    skills: "AI skill definition",
    mcp: "MCP server configuration",
    prompts: "AI prompt template",
    hooks: "AI tool automation hook",
    agents: "AI agent configuration",
  };
  return map[cat] || "AI resource";
}
