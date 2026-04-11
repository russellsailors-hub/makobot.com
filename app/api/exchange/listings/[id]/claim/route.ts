import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

// POST /api/exchange/listings/[id]/claim — Claim an imported listing
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Sign in to claim a listing" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id } = await params;
    const listingId = parseInt(id);

    const sql = neon(process.env.DATABASE_URL!);

    // Verify listing exists and is a community import
    const rows = await sql`SELECT id, source_url, user_id FROM exchange_listings WHERE id = ${listingId}`;
    if (rows.length === 0) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (!rows[0].source_url) return NextResponse.json({ error: "This listing is not a community import" }, { status: 400 });

    // Transfer ownership
    await sql`UPDATE exchange_listings SET user_id = ${user.id}, source_url = NULL, source_author = NULL, updated_at = NOW() WHERE id = ${listingId}`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Failed to claim listing" }, { status: 500 });
  }
}
