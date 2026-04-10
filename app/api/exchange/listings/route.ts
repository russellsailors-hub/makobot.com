import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getExchangeListings,
  getExchangeListingBySlug,
  getExchangeReviews,
  createExchangeListing,
  getUserByEmail,
} from "@/lib/db";
import { CATEGORIES, PLATFORMS, MAX_FILE_SIZE, MAX_CONTENT_LENGTH } from "@/lib/exchange";
import { moderateExchangeListing } from "@/lib/db";

// AI Auto-moderation: checks content quality and safety
async function autoModerate(
  listingId: number,
  title: string,
  description: string,
  content: string | null
): Promise<boolean> {
  try {
    const combined = `${title} ${description} ${content || ""}`.toLowerCase();

    // Reject: obvious spam patterns
    const spamPatterns = [
      /buy\s+(cheap|now|online)/,
      /click\s+here/,
      /free\s+(money|bitcoin|crypto)/,
      /\b(viagra|cialis|pharmacy)\b/,
      /make\s+\$?\d+.*per\s+(day|hour|week)/,
      /(telegram|whatsapp).*contact/,
      /bit\.ly|tinyurl|t\.co/,
    ];
    for (const pattern of spamPatterns) {
      if (pattern.test(combined)) return false;
    }

    // Reject: too short to be useful
    if (description.length < 20) return false;
    if (title.length < 5) return false;

    // Reject: no actual content (just title + short description, no substance)
    if (!content && description.length < 50) return false;

    // Reject: excessive links (likely spam)
    const linkCount = (combined.match(/https?:\/\//g) || []).length;
    if (linkCount > 10) return false;

    // Reject: mostly uppercase (shouting)
    const upperRatio = (combined.match(/[A-Z]/g) || []).length / combined.length;
    if (upperRatio > 0.5 && combined.length > 50) return false;

    // Reject: contains obvious malicious patterns
    const maliciousPatterns = [
      /rm\s+-rf\s+\//,
      /eval\s*\(\s*atob/,
      /document\.cookie/,
      /window\.location\s*=\s*['"]/,
      /<script[\s>]/i,
    ];
    for (const pattern of maliciousPatterns) {
      if (pattern.test(combined)) return false;
    }

    // Auto-approve: has meaningful content
    const hasContent = content && content.length > 50;
    const hasDescription = description.length >= 50;
    const hasMeaningfulTitle = title.length >= 10;

    if (hasContent && hasDescription && hasMeaningfulTitle) {
      await moderateExchangeListing(listingId, "approve");
      return true;
    }

    // Everything else stays pending for manual review
    return false;
  } catch {
    // If moderation fails, leave as pending (safe default)
    return false;
  }
}

// GET /api/exchange/listings — Browse listings OR get single by slug (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // If slug is provided, return single listing with reviews
    const slug = searchParams.get("slug");
    if (slug) {
      const listing = await getExchangeListingBySlug(slug);
      if (!listing || listing.status !== "approved") {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }
      const reviews = await getExchangeReviews(listing.id);
      const { file_data, ...cleaned } = listing;
      return NextResponse.json({
        listing: { ...cleaned, has_file: !!file_data },
        reviews,
      });
    }

    // Otherwise, browse listings
    const category = searchParams.get("category") || undefined;
    const platform = searchParams.get("platform") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "newest";
    const limit = parseInt(searchParams.get("limit") || "24");
    const offset = parseInt(searchParams.get("offset") || "0");

    const listings = await getExchangeListings({
      category,
      platform,
      search,
      sort,
      limit,
      offset,
    });

    // Strip file_data from browse results (too large)
    const cleaned = listings.map((l: Record<string, unknown>) => {
      const { file_data, ...rest } = l;
      return rest;
    });

    return NextResponse.json({ listings: cleaned });
  } catch (error) {
    console.error("Exchange browse error:", error);
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
  }
}

// POST /api/exchange/listings — Submit new listing (auth required)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sign in to submit a listing" }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const platformsRaw = formData.get("platforms") as string;
    const content = formData.get("content") as string | null;
    const screenshotUrl = formData.get("screenshot_url") as string | null;
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (!title || !description || !category || !platformsRaw) {
      return NextResponse.json({ error: "Title, description, category, and platforms are required" }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Title must be under 200 characters" }, { status: 400 });
    }

    if (description.length > 5000) {
      return NextResponse.json({ error: "Description must be under 5000 characters" }, { status: 400 });
    }

    // Validate category
    const validCategories = CATEGORIES.map((c) => c.value);
    if (!validCategories.includes(category as typeof validCategories[number])) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate platforms
    const platforms = JSON.parse(platformsRaw) as string[];
    const validPlatforms = PLATFORMS.map((p) => p.value);
    if (!platforms.every((p) => validPlatforms.includes(p as typeof validPlatforms[number]))) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Validate content length
    if (content && content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: "Content is too large (max 500KB)" }, { status: 400 });
    }

    // Process file if uploaded
    let fileData: Buffer | null = null;
    let fileName: string | null = null;
    let fileSize = 0;

    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File too large (max 500KB)" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      fileData = Buffer.from(arrayBuffer);
      fileName = file.name;
      fileSize = file.size;
    }

    const listing = await createExchangeListing({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      platforms,
      content: content?.trim() || null,
      file_name: fileName,
      file_data: fileData,
      file_size: fileSize,
      screenshot_url: screenshotUrl?.trim() || null,
    });

    // AI Auto-moderation: auto-approve if content passes quality checks
    const autoApproved = await autoModerate(listing.id, title.trim(), description.trim(), content?.trim() || null);

    // Strip file_data from response
    const { file_data: _, ...cleaned } = listing;
    return NextResponse.json({
      listing: { ...cleaned, status: autoApproved ? "approved" : "pending" },
      autoApproved,
    }, { status: 201 });
  } catch (error) {
    console.error("Exchange submit error:", error);
    return NextResponse.json({ error: "Failed to submit listing" }, { status: 500 });
  }
}
