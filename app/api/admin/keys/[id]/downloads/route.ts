import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDownloadsByKey } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const keyId = parseInt(id);
  if (!Number.isFinite(keyId)) {
    return NextResponse.json({ error: "Invalid key id" }, { status: 400 });
  }

  const downloads = await getDownloadsByKey(keyId);
  return NextResponse.json({ downloads });
}
