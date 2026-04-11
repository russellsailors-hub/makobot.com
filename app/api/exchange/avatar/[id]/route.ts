import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/exchange/avatar/[id] — Serve uploaded avatar image (public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT avatar_data, avatar_type FROM users WHERE id = ${parseInt(id)}`;

    if (rows.length === 0 || !rows[0].avatar_data) {
      return NextResponse.json({ error: "No avatar" }, { status: 404 });
    }

    const buffer = Buffer.from(rows[0].avatar_data as string, "hex");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": (rows[0].avatar_type as string) || "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load avatar" }, { status: 500 });
  }
}
