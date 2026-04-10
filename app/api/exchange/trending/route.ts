import { NextResponse } from "next/server";
import { getTrendingExchangeListings, getFeaturedExchangeListings } from "@/lib/db";

// GET /api/exchange/trending — Trending + featured listings (public)
export async function GET() {
  try {
    const [trending, featured] = await Promise.all([
      getTrendingExchangeListings(6),
      getFeaturedExchangeListings(3),
    ]);

    const clean = (items: Record<string, unknown>[]) =>
      items.map(({ file_data, ...rest }) => rest);

    return NextResponse.json({
      trending: clean(trending),
      featured: clean(featured),
    });
  } catch (error) {
    console.error("Trending error:", error);
    return NextResponse.json({ error: "Failed to load trending" }, { status: 500 });
  }
}
