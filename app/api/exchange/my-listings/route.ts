import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getExchangeListingsByUser } from "@/lib/db";

// GET /api/exchange/my-listings — User's own listings (auth required)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const listings = await getExchangeListingsByUser(user.id);

    // Strip file_data
    const cleaned = listings.map((l: Record<string, unknown>) => {
      const { file_data, ...rest } = l;
      return rest;
    });

    return NextResponse.json({ listings: cleaned });
  } catch (error) {
    console.error("My listings error:", error);
    return NextResponse.json({ error: "Failed to load your listings" }, { status: 500 });
  }
}
