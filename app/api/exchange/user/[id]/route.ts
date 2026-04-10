import { NextResponse } from "next/server";
import { getExchangeUserProfile } from "@/lib/db";

// GET /api/exchange/user/[id] — Public user profile (public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getExchangeUserProfile(parseInt(id));

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
