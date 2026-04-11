import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setUserVerified } from "@/lib/db";

// POST /api/admin/users/[id]/verify — Toggle verified status (admin only)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    await setUserVerified(parseInt(id), !!body.verified);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Verify user error:", error);
    return NextResponse.json({ error: "Failed to verify user" }, { status: 500 });
  }
}
