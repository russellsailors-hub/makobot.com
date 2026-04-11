import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getCreatorAnalytics } from "@/lib/db";

// GET /api/exchange/creator-analytics — Current user's analytics
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const analytics = await getCreatorAnalytics(user.id);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Creator analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
