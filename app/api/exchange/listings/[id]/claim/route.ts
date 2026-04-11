import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

// POST /api/exchange/listings/[id]/claim — Request to claim an imported listing
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
    const body = await request.json().catch(() => ({}));
    const githubUsername = (body.github_username || "").trim();

    if (!githubUsername) {
      return NextResponse.json({ error: "Enter your GitHub username so we can verify ownership" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Verify listing exists and is a community import
    const rows = await sql`SELECT id, source_url, source_author, title FROM exchange_listings WHERE id = ${listingId}`;
    if (rows.length === 0) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (!rows[0].source_url) return NextResponse.json({ error: "This listing is not a community import" }, { status: 400 });

    // Log the claim request as an event for admin review
    await sql`
      INSERT INTO events (type, data, user_id, ip)
      VALUES (
        'claim_request',
        ${JSON.stringify({
          listing_id: listingId,
          listing_title: rows[0].title,
          source_author: rows[0].source_author,
          claimed_github_username: githubUsername,
          user_email: session.user.email,
          user_id: user.id,
          username: user.username,
        })},
        ${user.id},
        'server'
      )
    `;

    // Auto-approve if GitHub username matches source_author exactly
    if (rows[0].source_author && githubUsername.toLowerCase() === (rows[0].source_author as string).toLowerCase()) {
      await sql`UPDATE exchange_listings SET user_id = ${user.id}, source_url = NULL, source_author = NULL, updated_at = NOW() WHERE id = ${listingId}`;
      return NextResponse.json({ ok: true, autoApproved: true, message: "GitHub username matches. Listing transferred to your account." });
    }

    // Otherwise, pending admin review
    return NextResponse.json({
      ok: true,
      autoApproved: false,
      message: "Claim request submitted. An admin will verify your ownership and transfer the listing.",
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 });
  }
}
