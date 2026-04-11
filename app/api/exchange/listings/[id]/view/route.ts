import { NextResponse } from "next/server";
import { incrementExchangeView } from "@/lib/db";

// POST /api/exchange/listings/[id]/view — Track a view (public)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await incrementExchangeView(parseInt(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
