import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getPublicCollections, getUserCollections, createExchangeCollection } from "@/lib/db";

// GET /api/exchange/collections — List public collections or user's own
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine");

    if (mine) {
      const session = await auth();
      if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const user = await getUserByEmail(session.user.email);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const collections = await getUserCollections(user.id);
      return NextResponse.json({ collections });
    }

    const collections = await getPublicCollections();
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Collections error:", error);
    return NextResponse.json({ error: "Failed to load collections" }, { status: 500 });
  }
}

// POST /api/exchange/collections — Create a new collection
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Sign in to create collections" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { title, description } = await request.json();
    if (!title || !description) return NextResponse.json({ error: "Title and description required" }, { status: 400 });

    const collection = await createExchangeCollection(user.id, title.trim(), description.trim());
    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
