import { NextResponse } from "next/server";
import { getRelatedListings } from "@/lib/db";

// GET /api/exchange/related?id=X&category=Y — Get related listings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");
    const category = searchParams.get("category") || "";

    if (!id || !category) {
      return NextResponse.json({ error: "id and category required" }, { status: 400 });
    }

    const related = await getRelatedListings(id, category);
    const cleaned = related.map((l: Record<string, unknown>) => {
      const { file_data, ...rest } = l;
      return rest;
    });

    return NextResponse.json({ related: cleaned });
  } catch (error) {
    console.error("Related listings error:", error);
    return NextResponse.json({ error: "Failed to load related" }, { status: 500 });
  }
}
