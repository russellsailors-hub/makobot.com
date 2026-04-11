import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, createExchangeComment, getExchangeComments, deleteExchangeComment } from "@/lib/db";

// GET /api/exchange/listings/[id]/comments — Get comments
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await getExchangeComments(parseInt(id));
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

// POST /api/exchange/listings/[id]/comments — Create comment
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id } = await params;
    const body = await request.json();
    const { body: commentBody, parent_id } = body;

    if (!commentBody || commentBody.trim().length < 1) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }
    if (commentBody.length > 2000) {
      return NextResponse.json({ error: "Comment too long (max 2000 chars)" }, { status: 400 });
    }

    const comment = await createExchangeComment(parseInt(id), user.id, commentBody.trim(), parent_id);
    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

// DELETE /api/exchange/listings/[id]/comments?commentId=X — Delete comment
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const commentId = parseInt(searchParams.get("commentId") || "0");
    if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });

    await deleteExchangeComment(commentId, user.id, session.user.isAdmin || false);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Comments DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
