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
    const rows = await sql`SELECT id, source_url, source_author, title FROM exchange_listings WHERE id = ${listingId}`;
    if (rows.length === 0) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (!rows[0].source_url) return NextResponse.json({ error: "This listing is not a community import" }, { status: 400 });

    const sourceAuthor = (rows[0].source_author as string || "").toLowerCase();
    const userGithub = (user.github_username as string || "").toLowerCase();

    // If user signed in with GitHub and their username matches -- instant transfer
    if (userGithub && sourceAuthor && userGithub === sourceAuthor) {
      await sql`UPDATE exchange_listings SET user_id = ${user.id}, source_url = NULL, source_author = NULL, updated_at = NOW() WHERE id = ${listingId}`;
      return NextResponse.json({
        ok: true,
        autoApproved: true,
        message: "Verified. Your GitHub account matches the original author. Listing transferred to your account.",
      });
    }

    // If user has a GitHub account but it doesn't match
    if (userGithub && sourceAuthor && userGithub !== sourceAuthor) {
      // Log the attempt
      await sql`
        INSERT INTO events (type, data, user_id, ip)
        VALUES ('claim_request', ${JSON.stringify({
          listing_id: listingId,
          listing_title: rows[0].title,
          source_author: rows[0].source_author,
          user_github: userGithub,
          user_email: session.user.email,
          status: "denied_mismatch",
        })}, ${user.id}, 'server')
      `;
      return NextResponse.json({
        error: `Your GitHub username (@${userGithub}) does not match the original author (@${sourceAuthor}). Only the original author can claim this listing.`,
      }, { status: 403 });
    }

    // If user doesn't have a GitHub account linked
    if (!userGithub) {
      return NextResponse.json({
        error: "Sign in with GitHub to claim this listing. Your GitHub account must match the original author.",
      }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to verify ownership" }, { status: 400 });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Failed to process claim" }, { status: 500 });
  }
}
