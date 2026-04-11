import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, updateUserProfile } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

// GET /api/exchange/profile — Get current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// PATCH /api/exchange/profile — Update current user's profile
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { username, display_name, bio, avatar_url } = body;

    // Validate username
    if (username !== undefined) {
      const clean = username.trim().toLowerCase();
      if (clean.length < 3) return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
      if (clean.length > 30) return NextResponse.json({ error: "Username must be under 30 characters" }, { status: 400 });
      if (!/^[a-z0-9_-]+$/.test(clean)) return NextResponse.json({ error: "Username can only contain letters, numbers, hyphens, and underscores" }, { status: 400 });
    }

    if (display_name !== undefined && display_name.trim().length > 50) {
      return NextResponse.json({ error: "Display name must be under 50 characters" }, { status: 400 });
    }

    if (bio !== undefined && bio.trim().length > 500) {
      return NextResponse.json({ error: "Bio must be under 500 characters" }, { status: 400 });
    }

    const result = await updateUserProfile(user.id, {
      username: username?.trim().toLowerCase(),
      display_name: display_name?.trim(),
      bio: bio?.trim(),
      avatar_url: avatar_url?.trim(),
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

// POST /api/exchange/profile — Upload avatar image
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sql = neon(process.env.DATABASE_URL!);
    await sql`UPDATE users SET avatar_data = ${buffer}, avatar_type = ${file.type}, avatar_url = ${`/api/exchange/avatar/${user.id}?v=${Date.now()}`} WHERE id = ${user.id}`;

    return NextResponse.json({
      avatar_url: `/api/exchange/avatar/${user.id}?v=${Date.now()}`,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
