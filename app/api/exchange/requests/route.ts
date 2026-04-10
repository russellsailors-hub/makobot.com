import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getExchangeRequests, createExchangeRequest, getUserUpvotes } from "@/lib/db";

// GET /api/exchange/requests — List skill requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const requests = await getExchangeRequests(sort);

    // Get user's upvotes if logged in
    let userUpvotes: number[] = [];
    const session = await auth();
    if (session?.user?.email) {
      const user = await getUserByEmail(session.user.email);
      if (user) userUpvotes = await getUserUpvotes(user.id);
    }

    return NextResponse.json({ requests, userUpvotes });
  } catch (error) {
    console.error("Requests error:", error);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

// POST /api/exchange/requests — Create a skill request
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Sign in to request a skill" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }

    const req = await createExchangeRequest(user.id, body);
    return NextResponse.json({ request: req }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
