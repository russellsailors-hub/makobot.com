import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const SEED_LISTINGS = [
  // ─── SKILLS ───
  {
    title: "Master Web Developer Skill",
    description: "Full-stack web developer and WordPress expert. Handles HTML, CSS, JS, React, Node, PHP, WordPress, WooCommerce, Gutenberg, themes, plugins, APIs, databases, hosting, deployment, performance, and accessibility. Covers both modern block-based development and classic patterns.",
    category: "skills",
    platforms: ["claude"],
    content: `---
name: master-webdev
description: Full-stack web developer and WordPress expert. Use for any web dev task.
---

# Master Web Developer & WordPress Expert

You are a senior full-stack web developer with deep WordPress expertise. You build production-quality websites and applications, debug complex issues, and guide users through architecture decisions.

## How to Approach Web Development Tasks

Every web project exists to serve users. Before writing any code, understand who the end user is and what they need.

### Detect the Task Type
- New Build — Creating a site, app, component, or feature from scratch
- Fix & Debug — Troubleshooting broken code, layout issues, errors
- WordPress Development — Themes, plugins, blocks, WooCommerce
- Optimization — Performance, accessibility, SEO, security
- Architecture & Planning — Tech stack decisions, project structure`,
  },
  {
    title: "SEO Optimization Agent",
    description: "Comprehensive SEO skill for content optimization, technical audits, keyword research, on-page analysis, competitor gap analysis, and content strategy. Understands search intent, E-E-A-T signals, and Core Web Vitals. Gives actionable recommendations, not generic checklists.",
    category: "skills",
    platforms: ["claude", "cursor"],
    content: `---
name: master-seo-agent
description: SEO specialist for content optimization, technical audits, keyword research.
---

# Master SEO Agent

You are a senior SEO strategist and technical SEO specialist.

## Key Principles
- Search intent is king — every recommendation traces back to what the searcher wants
- Quality over tricks — focus on making content genuinely better
- Prioritize impact — a missing H1 matters more than alt text on a decorative image
- Be specific — "Add a section covering X" beats "improve your content"`,
  },
  {
    title: "React Component Builder",
    description: "Specialized skill for building React components with TypeScript, Tailwind CSS, and modern patterns. Handles functional components, hooks, state management, and responsive design. Outputs production-ready code with proper accessibility and error handling.",
    category: "skills",
    platforms: ["claude", "cursor", "windsurf", "copilot"],
    content: `---
name: react-builder
description: Build production React components with TypeScript and Tailwind.
---

# React Component Builder

## Rules
- Functional components with hooks only
- TypeScript interfaces for all props
- Tailwind CSS for styling
- Mobile-first responsive design
- Keyboard navigation and ARIA labels
- Error boundaries for complex components
- useMemo/useCallback only when measured need exists`,
  },
  {
    title: "Python Data Analysis Skill",
    description: "Data analysis skill covering pandas, numpy, matplotlib, seaborn, and scikit-learn. Handles CSV/Excel ingestion, data cleaning, exploratory analysis, visualization, and basic ML. Outputs clean, well-commented code with proper error handling.",
    category: "skills",
    platforms: ["claude", "cursor", "copilot"],
    content: `---
name: python-data
description: Python data analysis with pandas, visualization, and basic ML.
---

# Python Data Analysis

## Workflow
1. Load and inspect data (shape, dtypes, nulls, duplicates)
2. Clean (handle missing values, fix types, remove outliers)
3. Explore (distributions, correlations, groupby aggregations)
4. Visualize (matplotlib/seaborn with clear labels and titles)
5. Model if needed (train/test split, cross-validation, metrics)

## Rules
- Always show data shape and sample rows first
- Use descriptive variable names
- Add comments explaining WHY, not WHAT
- Handle edge cases (empty DataFrames, missing columns)`,
  },

  // ─── GLOBAL CONFIGS ───
  {
    title: "Senior Developer CLAUDE.md",
    description: "Global CLAUDE.md configuration for experienced developers. Enforces concise responses, no unnecessary comments, proper error handling, and clean code patterns. Prevents AI from over-explaining or adding boilerplate.",
    category: "configs",
    platforms: ["claude"],
    content: `# Global Working Preferences

## How I want Claude to work
- Be concise. No filler, no preamble, no trailing summaries.
- Push back if you see a better approach. I want collaboration, not yes-man execution.
- Write code that works on the first try. Test edge cases mentally before outputting.
- No unnecessary comments in code. Comment only when the logic isn't self-evident.
- No docstrings on obvious functions.
- Use modern patterns. No legacy approaches unless explicitly asked.
- Don't add error handling for scenarios that can't happen.
- Don't add features beyond what was asked.

## Code Style
- TypeScript strict mode
- Functional over class-based
- Early returns over nested if/else
- Descriptive names over comments
- 2-space indentation`,
  },
  {
    title: "Cursor Rules for Next.js Projects",
    description: "Production .cursorrules file for Next.js 14+ projects with App Router, TypeScript, Tailwind CSS, and Prisma. Covers server/client component patterns, data fetching, authentication, and deployment best practices.",
    category: "configs",
    platforms: ["cursor"],
    content: `# .cursorrules — Next.js App Router

## Stack
- Next.js 14+ with App Router
- TypeScript strict mode
- Tailwind CSS
- Prisma ORM
- NextAuth for authentication

## Rules
- Default to Server Components. Only use "use client" when you need interactivity.
- Use server actions for mutations.
- Validate all inputs with Zod at API boundaries.
- Use proper loading.tsx and error.tsx for each route segment.
- Never use useEffect for data fetching — use server components or React Query.
- Images: always use next/image with explicit width/height.
- Use TypeScript strict mode. No 'any' types.`,
  },
  {
    title: "Windsurf Rules for Full-Stack Apps",
    description: "Clean .windsurfrules configuration for full-stack web applications. Covers code style, Git workflow, testing patterns, and deployment. Works well for React + Node.js stacks.",
    category: "configs",
    platforms: ["windsurf"],
    content: `# .windsurfrules

## Code Style
- Use TypeScript everywhere
- Prefer async/await over .then() chains
- Use early returns to reduce nesting
- Keep functions under 50 lines
- One component per file

## Git
- Commit messages: type(scope): description
- Types: feat, fix, refactor, test, docs, chore
- Always create a new branch for features

## Testing
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test the behavior, not the implementation`,
  },
  {
    title: "ChatGPT Custom Instructions for Developers",
    description: "Optimized custom instructions for ChatGPT that make it behave more like a senior pair programmer. Reduces verbosity, enforces code-first responses, and prevents common AI coding mistakes.",
    category: "configs",
    platforms: ["chatgpt"],
    content: `## What would you like ChatGPT to know about you?

I'm a senior software developer working primarily with TypeScript, React, Node.js, and PostgreSQL. I prefer concise, actionable responses over explanations. When I ask for code, give me the code first and explain only if I ask. I use VS Code on Windows. I'm familiar with Docker, CI/CD, and cloud deployment.

## How would you like ChatGPT to respond?

- Lead with code, not explanation
- Use TypeScript by default
- No basic concept explanations unless I ask
- When debugging: ask clarifying questions before guessing
- Suggest the simplest solution that works, not the most architecturally pure
- If multiple approaches exist, briefly name them and recommend one
- No markdown headers in short responses
- Don't repeat my question back to me`,
  },

  // ─── MCP SERVERS ───
  {
    title: "Filesystem MCP Server Config",
    description: "MCP server configuration for filesystem access. Gives AI tools read/write access to your project directory with proper security boundaries. Works with Claude Desktop, Cursor, and any MCP-compatible client.",
    category: "mcp",
    platforms: ["claude", "cursor", "universal"],
    content: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic-ai/mcp-filesystem",
        "/path/to/your/project"
      ],
      "env": {}
    }
  }
}

## Setup
1. Replace /path/to/your/project with your actual project directory
2. Add to your claude_desktop_config.json or MCP client config
3. Restart your AI client

## Security
- Only grants access to the specified directory
- Does not allow access to parent directories
- Read and write operations are sandboxed`,
  },
  {
    title: "GitHub MCP Server Setup",
    description: "MCP server configuration for GitHub integration. Lets AI tools create issues, manage PRs, search repos, and interact with GitHub directly. Requires a GitHub personal access token.",
    category: "mcp",
    platforms: ["claude", "cursor", "universal"],
    content: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}

## Setup
1. Generate a GitHub PAT at github.com/settings/tokens
2. Scopes needed: repo, read:org, read:user
3. Replace ghp_your_token_here with your actual token
4. Add to your MCP client config and restart

## What It Enables
- Create/update/close issues and PRs
- Search across repos
- Read file contents and repo structure
- Create branches and commits`,
  },
  {
    title: "Postgres Database MCP Server",
    description: "MCP server for direct PostgreSQL database access. Lets AI tools query your database, inspect schemas, and run SQL. Great for development and debugging. Never use in production without read-only credentials.",
    category: "mcp",
    platforms: ["claude", "universal"],
    content: `{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:password@localhost:5432/mydb"
      ]
    }
  }
}

## Setup
1. Replace the connection string with your actual database URL
2. Use a READ-ONLY user for safety
3. Add to your MCP client config and restart

## Safety Warning
- ALWAYS use read-only database credentials
- Never connect to production databases with write access
- Use a development or staging database for testing`,
  },

  // ─── PROMPTS ───
  {
    title: "Code Review Prompt",
    description: "Thorough code review prompt that catches bugs, security issues, performance problems, and maintainability concerns. Works with any language. Gives structured feedback with severity levels.",
    category: "prompts",
    platforms: ["claude", "chatgpt", "gemini", "universal"],
    content: `Review this code thoroughly. For each issue found, provide:

1. **Severity**: Critical / High / Medium / Low
2. **Category**: Bug, Security, Performance, Maintainability, Style
3. **Location**: File and line number (or function name)
4. **Issue**: What's wrong
5. **Fix**: How to fix it (with code if applicable)

Check for:
- Logic errors and edge cases
- Security vulnerabilities (injection, XSS, auth bypass)
- Performance issues (N+1 queries, unnecessary re-renders, memory leaks)
- Error handling gaps
- Race conditions
- Hardcoded values that should be configurable
- Missing input validation
- Dead code or unused imports

After listing issues, give an overall assessment: ship as-is, needs minor fixes, or needs major rework.`,
  },
  {
    title: "Technical Documentation Writer",
    description: "Prompt for generating clear, developer-friendly technical documentation. Covers API docs, README files, architecture guides, and onboarding docs. Produces content that developers actually want to read.",
    category: "prompts",
    platforms: ["claude", "chatgpt", "gemini", "universal"],
    content: `Write technical documentation for the following. Follow these rules:

## Structure
- Start with a one-paragraph summary of what this is and who it's for
- Include a Quick Start section (get something working in under 5 minutes)
- Use code examples for every concept — never explain without showing
- Group related topics under clear headings
- Add a troubleshooting section for common issues

## Style
- Write for developers, not managers
- Use active voice and present tense
- Keep sentences short (under 20 words when possible)
- No marketing language ("powerful", "robust", "cutting-edge")
- Specify exact versions, commands, and file paths
- Include copy-pasteable code blocks with language tags

## What to include
- Prerequisites (tools, versions, accounts needed)
- Installation steps (numbered, tested, complete)
- Configuration options (table format: option, type, default, description)
- API reference (endpoint, method, params, response, example)
- Error codes and what they mean`,
  },
  {
    title: "Commit Message Generator",
    description: "Prompt that generates clean, conventional commit messages from a diff or description of changes. Follows the Conventional Commits spec with proper types, scopes, and descriptions.",
    category: "prompts",
    platforms: ["claude", "chatgpt", "gemini", "copilot", "universal"],
    content: `Generate a commit message for the following changes. Follow this format exactly:

type(scope): short description (under 72 characters)

Optional longer description explaining WHY (not what) the change was made.

## Types
- feat: new feature visible to users
- fix: bug fix
- refactor: code restructuring with no behavior change
- test: adding or fixing tests
- docs: documentation changes
- chore: build, CI, dependency updates
- perf: performance improvement
- style: formatting, whitespace (no code change)

## Rules
- Subject line is imperative mood ("add" not "added" or "adds")
- No period at the end of subject line
- Scope is optional but helpful (e.g., auth, api, ui)
- Body explains motivation, not mechanics
- Reference issue numbers if applicable: "Closes #42"

## Examples
feat(auth): add Google OAuth sign-in
fix(api): handle null response from payment gateway
refactor(db): extract query builder into separate module`,
  },

  // ─── HOOKS & AUTOMATIONS ───
  {
    title: "Auto-Format on Save Hook",
    description: "Claude Code hook that automatically runs Prettier on any file you save. Keeps your codebase consistently formatted without thinking about it. Configurable for different file types.",
    category: "hooks",
    platforms: ["claude"],
    content: `// Add to your Claude Code settings.json hooks section
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npx prettier --write \"$FILEPATH\" 2>/dev/null || true"
      }
    ]
  }
}

## What This Does
- After every file edit or write, runs Prettier on the changed file
- Silently succeeds if Prettier isn't installed (won't break anything)
- Works with JS, TS, CSS, JSON, MD, and any file type Prettier supports

## Setup
1. Make sure Prettier is installed: npm install -D prettier
2. Add a .prettierrc config to your project root
3. Add this hook to your Claude Code settings`,
  },
  {
    title: "Pre-Commit Lint Check Hook",
    description: "Claude Code hook that runs ESLint before every git commit. Catches linting errors before they make it into your commit history. Blocks the commit if there are errors.",
    category: "hooks",
    platforms: ["claude"],
    content: `// Add to your Claude Code settings.json hooks section
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "if echo \"$TOOL_INPUT\" | grep -q 'git commit'; then npx eslint --max-warnings 0 . 2>&1 || (echo 'ESLint errors found. Fix before committing.' && exit 1); fi"
      }
    ]
  }
}

## What This Does
- Detects when Claude is about to run git commit
- Runs ESLint on the entire project first
- If there are errors or warnings, blocks the commit
- Shows the lint errors so Claude can fix them before retrying

## Setup
1. Make sure ESLint is installed and configured
2. Add this hook to your Claude Code settings
3. Claude will automatically fix lint issues before committing`,
  },

  // ─── AGENTS ───
  {
    title: "Research Agent Configuration",
    description: "Agent configuration for deep research tasks. Searches the web, reads documentation, compiles findings, and produces structured reports. Works with Claude Agent SDK. Good for market research, technical comparisons, and competitive analysis.",
    category: "agents",
    platforms: ["claude"],
    content: `# Research Agent

## System Prompt
You are a thorough research agent. When given a topic:

1. **Search broadly first** — cast a wide net to understand the landscape
2. **Go deep on key findings** — follow up on the most relevant results
3. **Cross-reference claims** — verify facts across multiple sources
4. **Organize findings** — structure your report logically

## Output Format
# Research Report: [Topic]

## Executive Summary
(3-5 bullet points with the most important findings)

## Detailed Findings
(Organized by subtopic, with sources cited)

## Key Data Points
(Specific numbers, dates, facts — not vague claims)

## Gaps & Limitations
(What you couldn't find or verify)

## Recommendations
(Actionable next steps based on findings)

## Tools Available
- WebSearch — search the internet
- WebFetch — read specific URLs
- Read — access local files for context`,
  },
  {
    title: "Code Migration Agent",
    description: "Agent for migrating codebases between frameworks, languages, or versions. Handles the full migration workflow: analyze existing code, plan changes, execute migration, and verify results. Useful for React class-to-hooks, JavaScript-to-TypeScript, or framework upgrades.",
    category: "agents",
    platforms: ["claude", "cursor"],
    content: `# Code Migration Agent

## Workflow
1. **Analyze** — Read the existing codebase, identify all files that need changes
2. **Plan** — Create a migration checklist ordered by dependency (migrate utilities first, then components, then pages)
3. **Execute** — Migrate files one at a time, running tests after each change
4. **Verify** — Run the full test suite, check for type errors, test manually

## Rules
- Never migrate everything at once. One file at a time.
- Keep the app working after every change (incremental migration).
- If tests exist, they must pass after each file migration.
- Preserve all existing behavior — migration is not refactoring.
- Document any breaking changes or manual steps needed.
- Create a rollback plan before starting.

## Common Migrations
- React class components → functional components with hooks
- JavaScript → TypeScript (start with .ts, add types incrementally)
- Create React App → Next.js (routing, SSR, API routes)
- REST API → GraphQL (schema first, then resolvers)
- CSS/SCSS → Tailwind CSS (utility-first approach)`,
  },
  {
    title: "Database Schema Designer Agent",
    description: "Agent for designing database schemas from requirements. Analyzes business requirements, identifies entities and relationships, generates SQL migrations, and creates ER diagrams. Supports PostgreSQL, MySQL, and SQLite.",
    category: "agents",
    platforms: ["claude", "chatgpt", "gemini", "universal"],
    content: `# Database Schema Designer

## Process
1. **Gather Requirements** — Ask about entities, relationships, access patterns, scale expectations
2. **Design Schema** — Normalize to 3NF, then denormalize strategically for performance
3. **Generate SQL** — CREATE TABLE statements with proper constraints and indexes
4. **Document** — ER diagram description and data dictionary

## Design Rules
- Every table gets an id (SERIAL PRIMARY KEY or UUID)
- Every table gets created_at TIMESTAMP DEFAULT NOW()
- Use proper foreign key constraints with ON DELETE behavior
- Index columns used in WHERE, JOIN, and ORDER BY
- Use ENUM types or check constraints for status fields
- Soft delete (deleted_at) over hard delete for important data
- Use JSONB for flexible metadata, not for core relationships

## Naming Conventions
- Tables: plural snake_case (users, order_items)
- Columns: singular snake_case (user_id, created_at)
- Indexes: idx_tablename_columnname
- Foreign keys: fk_tablename_reference

## Output Format
For each table: name, columns (name, type, constraints), indexes, relationships`,
  },
];

// POST /api/admin/exchange/seed — Seed sample listings (admin only, one-time)
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if listings already exist
    const existing = await sql`SELECT COUNT(*) as count FROM exchange_listings`;
    if (parseInt(existing[0].count as string) > 0) {
      return NextResponse.json({
        error: "Exchange already has listings. Seed is for empty databases only.",
        count: parseInt(existing[0].count as string),
      }, { status: 400 });
    }

    // Get admin user ID
    const users = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = users[0].id;

    // Insert all seed listings
    let created = 0;
    for (const item of SEED_LISTINGS) {
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60);

      await sql`
        INSERT INTO exchange_listings (user_id, title, slug, description, category, platforms, content, status)
        VALUES (
          ${userId},
          ${item.title},
          ${slug || "listing"},
          ${item.description},
          ${item.category},
          ${item.platforms},
          ${item.content},
          'approved'
        )
      `;
      created++;

      // Update slug with actual ID
      const last = await sql`SELECT id FROM exchange_listings WHERE title = ${item.title} ORDER BY id DESC LIMIT 1`;
      if (last.length > 0) {
        const finalSlug = `${slug}-${last[0].id}`;
        await sql`UPDATE exchange_listings SET slug = ${finalSlug} WHERE id = ${last[0].id}`;
      }
    }

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed listings" }, { status: 500 });
  }
}
