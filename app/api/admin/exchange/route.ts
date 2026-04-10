import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPendingExchangeListings, moderateExchangeListing, getExchangeStats } from "@/lib/db";

// GET /api/admin/exchange — Moderation queue + stats (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [pending, stats] = await Promise.all([
      getPendingExchangeListings(),
      getExchangeStats(),
    ]);

    // Strip file_data
    const cleaned = pending.map((l: Record<string, unknown>) => {
      const { file_data, ...rest } = l;
      return rest;
    });

    return NextResponse.json({ pending: cleaned, stats });
  } catch (error) {
    console.error("Admin exchange error:", error);
    return NextResponse.json({ error: "Failed to load moderation queue" }, { status: 500 });
  }
}

// PATCH /api/admin/exchange — Approve or reject listing (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { listingId, action, reason } = await request.json();

    if (!listingId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await moderateExchangeListing(listingId, action, reason);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin moderation error:", error);
    return NextResponse.json({ error: "Failed to moderate listing" }, { status: 500 });
  }
}
