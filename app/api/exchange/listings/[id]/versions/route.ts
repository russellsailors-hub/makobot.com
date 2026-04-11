import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, createExchangeVersion, getExchangeVersions } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

// GET /api/exchange/listings/[id]/versions — Get version history
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const versions = await getExchangeVersions(parseInt(id));
    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Versions GET error:", error);
    return NextResponse.json({ error: "Failed to load versions" }, { status: 500 });
  }
}

// POST /api/exchange/listings/[id]/versions — Create new version
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id } = await params;
    const body = await request.json();
    const { version, changelog, content } = body;

    if (!version || !content) return NextResponse.json({ error: "version and content required" }, { status: 400 });

    // Verify ownership
    const sql = neon(process.env.DATABASE_URL!);
    const listing = await sql`SELECT user_id FROM exchange_listings WHERE id = ${parseInt(id)}`;
    if (listing.length === 0) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing[0].user_id !== user.id) return NextResponse.json({ error: "Not your listing" }, { status: 403 });

    const result = await createExchangeVersion(parseInt(id), version, changelog || "", content);
    return NextResponse.json({ version: result });
  } catch (error) {
    console.error("Versions POST error:", error);
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }
}
