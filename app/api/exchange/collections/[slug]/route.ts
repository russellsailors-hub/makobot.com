import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getCollection, addToCollection, removeFromCollection, deleteCollection } from "@/lib/db";

// GET /api/exchange/collections/[slug] — Get collection detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const collection = await getCollection(slug);
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Collection detail error:", error);
    return NextResponse.json({ error: "Failed to load collection" }, { status: 500 });
  }
}

// PATCH /api/exchange/collections/[slug] — Add/remove items
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { slug } = await params;
    const collection = await getCollection(slug);
    const col = collection as Record<string, unknown>;
    if (!col || col.user_id !== user.id) {
      return NextResponse.json({ error: "Collection not found or not yours" }, { status: 404 });
    }

    const { action, listingId } = await request.json();
    if (action === "add") await addToCollection(col.id as number, listingId);
    if (action === "remove") await removeFromCollection(col.id as number, listingId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Collection update error:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

// DELETE /api/exchange/collections/[slug] — Delete collection
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { slug } = await params;
    const collection = await getCollection(slug) as Record<string, unknown> | null;
    if (!collection || collection.user_id !== user.id) {
      return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });
    }

    await deleteCollection(collection.id as number, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete collection error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
