import { NextResponse } from "next/server";
import { semanticSearchListings } from "@/lib/db";

// GET /api/exchange/semantic-search?q=... — Full-text semantic search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = await semanticSearchListings(query, 20);
    const cleaned = results.map((l: Record<string, unknown>) => {
      const { file_data, author_name, author_email, ...rest } = l;
      return rest;
    });

    return NextResponse.json({ results: cleaned });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
