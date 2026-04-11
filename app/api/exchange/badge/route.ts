import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/exchange/badge?slug=... — Returns an SVG badge for embedding
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT title, download_count, rating_avg FROM exchange_listings WHERE slug = ${slug} AND status = 'approved'`;
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const listing = rows[0];
    const title = String(listing.title).slice(0, 40);
    const downloads = listing.download_count as number;

    // Generate SVG badge
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="60" viewBox="0 0 280 60">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1E2330"/>
          <stop offset="100%" stop-color="#252B3B"/>
        </linearGradient>
      </defs>
      <rect width="280" height="60" rx="8" fill="url(#bg)" stroke="#3B82F6" stroke-width="2"/>
      <circle cx="30" cy="30" r="14" fill="#1E2330" stroke="#3B82F6" stroke-width="2"/>
      <text x="30" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">M</text>
      <text x="55" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#8B95A8" font-weight="600">FEATURED ON</text>
      <text x="55" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#E8EDF3" font-weight="700">MakoBot Exchange</text>
      <text x="270" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#3B82F6" font-weight="600" text-anchor="end">${downloads} ↓</text>
    </svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate badge" }, { status: 500 });
  }
}
