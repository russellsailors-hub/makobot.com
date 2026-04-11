import { NextResponse } from "next/server";
import { getListingRemixTree } from "@/lib/db";

// GET /api/exchange/listings/[id]/remix-tree — Get original + forks
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tree = await getListingRemixTree(parseInt(id));
    return NextResponse.json(tree);
  } catch (error) {
    console.error("Remix tree error:", error);
    return NextResponse.json({ error: "Failed to load remix tree" }, { status: 500 });
  }
}
