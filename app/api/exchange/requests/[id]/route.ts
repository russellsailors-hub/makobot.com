import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, upvoteExchangeRequest } from "@/lib/db";

// POST /api/exchange/requests/[id] — Upvote/un-upvote a request
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Sign in to upvote" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id } = await params;
    const upvoted = await upvoteExchangeRequest(parseInt(id), user.id);
    return NextResponse.json({ upvoted });
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json({ error: "Failed to upvote" }, { status: 500 });
  }
}
