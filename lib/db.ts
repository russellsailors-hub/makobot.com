import { neon } from "@neondatabase/serverless";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

// ─── SCHEMA SETUP ───
export async function setupDatabase() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS license_keys (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      key VARCHAR(255) UNIQUE NOT NULL,
      tier VARCHAR(50) DEFAULT 'free',
      status VARCHAR(50) DEFAULT 'active',
      activated_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS downloads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      version VARCHAR(50),
      ip VARCHAR(45),
      user_agent TEXT,
      country VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      path VARCHAR(500),
      referrer TEXT,
      user_agent TEXT,
      ip VARCHAR(45),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      type VARCHAR(100) NOT NULL,
      data JSONB,
      user_id INTEGER,
      ip VARCHAR(45),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exchange_listings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      platforms TEXT[] NOT NULL DEFAULT '{}',
      content TEXT,
      file_name VARCHAR(255),
      file_data BYTEA,
      file_size INTEGER DEFAULT 0,
      screenshot_url TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      rejection_reason TEXT,
      download_count INTEGER DEFAULT 0,
      rating_avg NUMERIC(3,2) DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exchange_reviews (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER REFERENCES exchange_listings(id) ON DELETE CASCADE NOT NULL,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(listing_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exchange_collections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      is_public BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exchange_collection_items (
      id SERIAL PRIMARY KEY,
      collection_id INTEGER REFERENCES exchange_collections(id) ON DELETE CASCADE NOT NULL,
      listing_id INTEGER REFERENCES exchange_listings(id) ON DELETE CASCADE NOT NULL,
      sort_order INTEGER DEFAULT 0,
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(collection_id, listing_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exchange_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50),
      platforms TEXT[] DEFAULT '{}',
      upvote_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exchange_request_upvotes (
      id SERIAL PRIMARY KEY,
      request_id INTEGER REFERENCES exchange_requests(id) ON DELETE CASCADE NOT NULL,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(request_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exchange_downloads (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER REFERENCES exchange_listings(id) ON DELETE CASCADE NOT NULL,
      user_id INTEGER,
      ip VARCHAR(45),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

// ─── USERS ───
export async function findOrCreateUser(profile: {
  google_id: string;
  email: string;
  name: string;
  avatar_url: string;
}) {
  const sql = getDb();
  const existing = await sql`
    SELECT * FROM users WHERE google_id = ${profile.google_id}
  `;
  if (existing.length > 0) return existing[0];

  const result = await sql`
    INSERT INTO users (google_id, email, name, avatar_url)
    VALUES (${profile.google_id}, ${profile.email}, ${profile.name}, ${profile.avatar_url})
    RETURNING *
  `;
  return result[0];
}

export async function getUserByEmail(email: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] || null;
}

export async function getUserById(id: number) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] || null;
}

export async function getAllUsers(limit = 100, offset = 0) {
  const sql = getDb();
  return sql`
    SELECT u.*,
      (SELECT COUNT(*) FROM license_keys WHERE user_id = u.id) as key_count,
      (SELECT COUNT(*) FROM downloads WHERE user_id = u.id) as download_count
    FROM users u
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function getUserCount() {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*) as count FROM users`;
  return parseInt(rows[0].count as string);
}

export async function setUserAdmin(userId: number, isAdmin: boolean) {
  const sql = getDb();
  await sql`UPDATE users SET is_admin = ${isAdmin} WHERE id = ${userId}`;
}

// ─── LICENSE KEYS ───
export async function createLicenseKey(userId: number, key: string, tier = "free") {
  const sql = getDb();
  const result = await sql`
    INSERT INTO license_keys (user_id, key, tier)
    VALUES (${userId}, ${key}, ${tier})
    RETURNING *
  `;
  return result[0];
}

export async function getKeyByUserId(userId: number) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM license_keys WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1
  `;
  return rows[0] || null;
}

export async function getAllKeys(limit = 100, offset = 0) {
  const sql = getDb();
  return sql`
    SELECT lk.*, u.email, u.name
    FROM license_keys lk
    JOIN users u ON lk.user_id = u.id
    ORDER BY lk.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function getKeyCount() {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*) as count FROM license_keys`;
  return parseInt(rows[0].count as string);
}

export async function getActiveKeyCount() {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*) as count FROM license_keys WHERE status = 'active'`;
  return parseInt(rows[0].count as string);
}

export async function updateKeyStatus(keyId: number, status: string) {
  const sql = getDb();
  await sql`UPDATE license_keys SET status = ${status} WHERE id = ${keyId}`;
}

export async function updateKeyTier(keyId: number, tier: string) {
  const sql = getDb();
  await sql`UPDATE license_keys SET tier = ${tier} WHERE id = ${keyId}`;
}

// ─── DOWNLOADS ───
export async function trackDownload(userId: number, ip: string, userAgent: string, version = "2.0.0") {
  const sql = getDb();
  await sql`
    INSERT INTO downloads (user_id, version, ip, user_agent)
    VALUES (${userId}, ${version}, ${ip}, ${userAgent})
  `;
}

export async function getDownloadCount() {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*) as count FROM downloads`;
  return parseInt(rows[0].count as string);
}

export async function getRecentDownloads(limit = 50) {
  const sql = getDb();
  return sql`
    SELECT d.*, u.email, u.name
    FROM downloads d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
    LIMIT ${limit}
  `;
}

export async function getDownloadsPerDay(days = 30) {
  const sql = getDb();
  return sql`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM downloads
    WHERE created_at > ${daysAgo(days)}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
}

// ─── PAGE VIEWS ───
export async function trackPageView(path: string, referrer: string | null, userAgent: string, ip: string) {
  const sql = getDb();
  await sql`
    INSERT INTO page_views (path, referrer, user_agent, ip)
    VALUES (${path}, ${referrer}, ${userAgent}, ${ip})
  `;
}

export async function getPageViewCount(days = 30) {
  const sql = getDb();
  const rows = await sql`
    SELECT COUNT(*) as count FROM page_views
    WHERE created_at > ${daysAgo(days)}
  `;
  return parseInt(rows[0].count as string);
}

export async function getPageViewsPerDay(days = 30) {
  const sql = getDb();
  return sql`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM page_views
    WHERE created_at > ${daysAgo(days)}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
}

export async function getTopPages(days = 30, limit = 20) {
  const sql = getDb();
  return sql`
    SELECT path, COUNT(*) as count
    FROM page_views
    WHERE created_at > ${daysAgo(days)}
    GROUP BY path
    ORDER BY count DESC
    LIMIT ${limit}
  `;
}

export async function getTopReferrers(days = 30, limit = 20) {
  const sql = getDb();
  return sql`
    SELECT referrer, COUNT(*) as count
    FROM page_views
    WHERE created_at > ${daysAgo(days)}
    AND referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT ${limit}
  `;
}

export async function getUniqueVisitors(days = 30) {
  const sql = getDb();
  const rows = await sql`
    SELECT COUNT(DISTINCT ip) as count FROM page_views
    WHERE created_at > ${daysAgo(days)}
  `;
  return parseInt(rows[0].count as string);
}

// ─── EVENTS ───
export async function trackEvent(type: string, data: Record<string, unknown> | null, userId: number | null, ip: string) {
  const sql = getDb();
  await sql`
    INSERT INTO events (type, data, user_id, ip)
    VALUES (${type}, ${JSON.stringify(data)}, ${userId}, ${ip})
  `;
}

export async function getRecentEvents(limit = 50) {
  const sql = getDb();
  return sql`
    SELECT e.*, u.email, u.name
    FROM events e
    LEFT JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
    LIMIT ${limit}
  `;
}

// ─── EXCHANGE LISTINGS ───
export async function createExchangeListing(data: {
  user_id: number;
  title: string;
  description: string;
  category: string;
  platforms: string[];
  content?: string | null;
  file_name?: string | null;
  file_data?: Buffer | null;
  file_size?: number;
  screenshot_url?: string | null;
}) {
  const sql = getDb();
  const result = await sql`
    INSERT INTO exchange_listings (user_id, title, slug, description, category, platforms, content, file_name, file_data, file_size, screenshot_url)
    VALUES (
      ${data.user_id},
      ${data.title},
      ${"temp-slug"},
      ${data.description},
      ${data.category},
      ${data.platforms},
      ${data.content || null},
      ${data.file_name || null},
      ${data.file_data || null},
      ${data.file_size || 0},
      ${data.screenshot_url || null}
    )
    RETURNING *
  `;
  const listing = result[0];
  // Update slug with the ID for uniqueness
  const slug = generateExchangeSlug(data.title, listing.id);
  await sql`UPDATE exchange_listings SET slug = ${slug} WHERE id = ${listing.id}`;
  listing.slug = slug;
  return listing;
}

function generateExchangeSlug(title: string, id: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "listing"}-${id}`;
}

export async function getExchangeListings(opts: {
  category?: string;
  platform?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  status?: string;
} = {}) {
  const sql = getDb();
  const limit = opts.limit || 24;
  const offset = opts.offset || 0;
  const status = opts.status || "approved";

  // Build dynamic query using conditional fragments
  // Neon tagged templates don't support dynamic WHERE easily,
  // so we use a flexible approach
  if (opts.search && opts.category && opts.platform) {
    const search = `%${opts.search}%`;
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
        AND el.category = ${opts.category}
        AND ${opts.platform} = ANY(el.platforms)
        AND (el.title ILIKE ${search} OR el.description ILIKE ${search})
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.search && opts.category) {
    const search = `%${opts.search}%`;
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
        AND el.category = ${opts.category}
        AND (el.title ILIKE ${search} OR el.description ILIKE ${search})
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.search && opts.platform) {
    const search = `%${opts.search}%`;
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
        AND ${opts.platform} = ANY(el.platforms)
        AND (el.title ILIKE ${search} OR el.description ILIKE ${search})
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.category && opts.platform) {
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
        AND el.category = ${opts.category}
        AND ${opts.platform} = ANY(el.platforms)
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.search) {
    const search = `%${opts.search}%`;
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
        AND (el.title ILIKE ${search} OR el.description ILIKE ${search})
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.category) {
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
        AND el.category = ${opts.category}
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.platform) {
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
        AND ${opts.platform} = ANY(el.platforms)
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${status}
      ORDER BY ${opts.sort === "top-rated" ? sql`el.rating_avg` : opts.sort === "most-downloaded" ? sql`el.download_count` : sql`el.created_at`} DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
}

export async function getExchangeListingBySlug(slug: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT el.*, u.name as author_name, u.avatar_url as author_avatar, u.email as author_email
    FROM exchange_listings el
    JOIN users u ON el.user_id = u.id
    WHERE el.slug = ${slug}
  `;
  return rows[0] || null;
}

export async function getExchangeListingsByUser(userId: number) {
  const sql = getDb();
  return sql`
    SELECT * FROM exchange_listings
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

export async function updateExchangeListing(id: number, userId: number, data: {
  title?: string;
  description?: string;
  category?: string;
  platforms?: string[];
  content?: string | null;
}) {
  const sql = getDb();
  const listing = await sql`SELECT * FROM exchange_listings WHERE id = ${id} AND user_id = ${userId}`;
  if (listing.length === 0) return null;

  if (data.title !== undefined) await sql`UPDATE exchange_listings SET title = ${data.title}, updated_at = NOW() WHERE id = ${id}`;
  if (data.description !== undefined) await sql`UPDATE exchange_listings SET description = ${data.description}, updated_at = NOW() WHERE id = ${id}`;
  if (data.category !== undefined) await sql`UPDATE exchange_listings SET category = ${data.category}, updated_at = NOW() WHERE id = ${id}`;
  if (data.platforms !== undefined) await sql`UPDATE exchange_listings SET platforms = ${data.platforms}, updated_at = NOW() WHERE id = ${id}`;
  if (data.content !== undefined) await sql`UPDATE exchange_listings SET content = ${data.content}, updated_at = NOW() WHERE id = ${id}`;

  const updated = await sql`SELECT * FROM exchange_listings WHERE id = ${id}`;
  return updated[0];
}

export async function deleteExchangeListing(id: number, userId: number, isAdmin = false) {
  const sql = getDb();
  if (isAdmin) {
    await sql`DELETE FROM exchange_listings WHERE id = ${id}`;
  } else {
    await sql`DELETE FROM exchange_listings WHERE id = ${id} AND user_id = ${userId}`;
  }
}

export async function incrementExchangeDownload(listingId: number, userId: number | null, ip: string) {
  const sql = getDb();
  await sql`UPDATE exchange_listings SET download_count = download_count + 1 WHERE id = ${listingId}`;
  await sql`INSERT INTO exchange_downloads (listing_id, user_id, ip) VALUES (${listingId}, ${userId}, ${ip})`;
}

// ─── EXCHANGE REVIEWS ───
export async function createExchangeReview(listingId: number, userId: number, rating: number, comment: string | null) {
  const sql = getDb();
  const result = await sql`
    INSERT INTO exchange_reviews (listing_id, user_id, rating, comment)
    VALUES (${listingId}, ${userId}, ${rating}, ${comment})
    ON CONFLICT (listing_id, user_id) DO UPDATE SET rating = ${rating}, comment = ${comment}
    RETURNING *
  `;
  // Update denormalized rating on listing
  await sql`
    UPDATE exchange_listings SET
      rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM exchange_reviews WHERE listing_id = ${listingId}),
      rating_count = (SELECT COUNT(*) FROM exchange_reviews WHERE listing_id = ${listingId})
    WHERE id = ${listingId}
  `;
  return result[0];
}

export async function getExchangeReviews(listingId: number) {
  const sql = getDb();
  return sql`
    SELECT er.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
    FROM exchange_reviews er
    JOIN users u ON er.user_id = u.id
    WHERE er.listing_id = ${listingId}
    ORDER BY er.created_at DESC
  `;
}

// ─── EXCHANGE ADMIN ───
export async function getPendingExchangeListings(limit = 50, offset = 0) {
  const sql = getDb();
  return sql`
    SELECT el.*, u.name as author_name, u.avatar_url as author_avatar, u.email as author_email
    FROM exchange_listings el
    JOIN users u ON el.user_id = u.id
    WHERE el.status = 'pending'
    ORDER BY el.created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function moderateExchangeListing(listingId: number, action: "approve" | "reject", reason?: string) {
  const sql = getDb();
  if (action === "approve") {
    await sql`UPDATE exchange_listings SET status = 'approved', updated_at = NOW() WHERE id = ${listingId}`;
  } else {
    await sql`UPDATE exchange_listings SET status = 'rejected', rejection_reason = ${reason || null}, updated_at = NOW() WHERE id = ${listingId}`;
  }
}

export async function getAllExchangeListings(opts: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const sql = getDb();
  const limit = opts.limit || 50;
  const offset = opts.offset || 0;

  if (opts.status && opts.search) {
    const search = `%${opts.search}%`;
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar, u.email as author_email
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${opts.status}
        AND (el.title ILIKE ${search} OR el.description ILIKE ${search} OR u.email ILIKE ${search})
      ORDER BY el.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.status) {
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar, u.email as author_email
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.status = ${opts.status}
      ORDER BY el.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (opts.search) {
    const search = `%${opts.search}%`;
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar, u.email as author_email
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE (el.title ILIKE ${search} OR el.description ILIKE ${search} OR u.email ILIKE ${search})
      ORDER BY el.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    return sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar, u.email as author_email
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      ORDER BY el.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
}

export async function adminUpdateExchangeListing(id: number, data: {
  title?: string;
  description?: string;
  category?: string;
  platforms?: string[];
  content?: string | null;
  status?: string;
  screenshot_url?: string | null;
}) {
  const sql = getDb();
  if (data.title !== undefined) await sql`UPDATE exchange_listings SET title = ${data.title}, updated_at = NOW() WHERE id = ${id}`;
  if (data.description !== undefined) await sql`UPDATE exchange_listings SET description = ${data.description}, updated_at = NOW() WHERE id = ${id}`;
  if (data.category !== undefined) await sql`UPDATE exchange_listings SET category = ${data.category}, updated_at = NOW() WHERE id = ${id}`;
  if (data.platforms !== undefined) await sql`UPDATE exchange_listings SET platforms = ${data.platforms}, updated_at = NOW() WHERE id = ${id}`;
  if (data.content !== undefined) await sql`UPDATE exchange_listings SET content = ${data.content}, updated_at = NOW() WHERE id = ${id}`;
  if (data.status !== undefined) await sql`UPDATE exchange_listings SET status = ${data.status}, updated_at = NOW() WHERE id = ${id}`;
  if (data.screenshot_url !== undefined) await sql`UPDATE exchange_listings SET screenshot_url = ${data.screenshot_url}, updated_at = NOW() WHERE id = ${id}`;
  const updated = await sql`SELECT * FROM exchange_listings WHERE id = ${id}`;
  return updated[0] || null;
}

export async function getExchangeListingById(id: number) {
  const sql = getDb();
  const rows = await sql`
    SELECT el.*, u.name as author_name, u.avatar_url as author_avatar, u.email as author_email
    FROM exchange_listings el
    JOIN users u ON el.user_id = u.id
    WHERE el.id = ${id}
  `;
  return rows[0] || null;
}

export async function getAllExchangeReviews(limit = 50, offset = 0) {
  const sql = getDb();
  return sql`
    SELECT er.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar,
           el.title as listing_title, el.slug as listing_slug
    FROM exchange_reviews er
    JOIN users u ON er.user_id = u.id
    JOIN exchange_listings el ON er.listing_id = el.id
    ORDER BY er.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function deleteExchangeReview(reviewId: number) {
  const sql = getDb();
  // Get the listing_id before deleting so we can update the rating
  const review = await sql`SELECT listing_id FROM exchange_reviews WHERE id = ${reviewId}`;
  await sql`DELETE FROM exchange_reviews WHERE id = ${reviewId}`;
  // Update denormalized rating
  if (review.length > 0) {
    const listingId = review[0].listing_id;
    await sql`
      UPDATE exchange_listings SET
        rating_avg = COALESCE((SELECT AVG(rating) FROM exchange_reviews WHERE listing_id = ${listingId}), 0),
        rating_count = (SELECT COUNT(*) FROM exchange_reviews WHERE listing_id = ${listingId})
      WHERE id = ${listingId}
    `;
  }
}

export async function getExchangeStats() {
  const sql = getDb();
  const [total, pending, approved, downloads] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM exchange_listings`,
    sql`SELECT COUNT(*) as count FROM exchange_listings WHERE status = 'pending'`,
    sql`SELECT COUNT(*) as count FROM exchange_listings WHERE status = 'approved'`,
    sql`SELECT COALESCE(SUM(download_count), 0) as count FROM exchange_listings`,
  ]);
  return {
    totalListings: parseInt(total[0].count as string),
    pendingCount: parseInt(pending[0].count as string),
    approvedCount: parseInt(approved[0].count as string),
    totalDownloads: parseInt(downloads[0].count as string),
  };
}

// ─── EXCHANGE: COLLECTIONS ───
export async function createExchangeCollection(userId: number, title: string, description: string) {
  const sql = getDb();
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
  const result = await sql`
    INSERT INTO exchange_collections (user_id, title, slug, description)
    VALUES (${userId}, ${title}, ${"temp-" + Date.now()}, ${description})
    RETURNING *
  `;
  const id = result[0].id;
  const finalSlug = `${slug}-${id}`;
  await sql`UPDATE exchange_collections SET slug = ${finalSlug} WHERE id = ${id}`;
  result[0].slug = finalSlug;
  return result[0];
}

export async function addToCollection(collectionId: number, listingId: number) {
  const sql = getDb();
  await sql`
    INSERT INTO exchange_collection_items (collection_id, listing_id)
    VALUES (${collectionId}, ${listingId})
    ON CONFLICT (collection_id, listing_id) DO NOTHING
  `;
}

export async function removeFromCollection(collectionId: number, listingId: number) {
  const sql = getDb();
  await sql`DELETE FROM exchange_collection_items WHERE collection_id = ${collectionId} AND listing_id = ${listingId}`;
}

export async function getCollection(slug: string) {
  const sql = getDb();
  const collection = await sql`
    SELECT ec.*, u.name as author_name, u.avatar_url as author_avatar
    FROM exchange_collections ec
    JOIN users u ON ec.user_id = u.id
    WHERE ec.slug = ${slug}
  `;
  if (collection.length === 0) return null;

  const items = await sql`
    SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
    FROM exchange_collection_items eci
    JOIN exchange_listings el ON eci.listing_id = el.id
    JOIN users u ON el.user_id = u.id
    WHERE eci.collection_id = ${collection[0].id} AND el.status = 'approved'
    ORDER BY eci.sort_order ASC
  `;

  return {
    ...collection[0],
    items: items.map((l: Record<string, unknown>) => { const { file_data, ...rest } = l; return rest; }),
  };
}

export async function getPublicCollections(limit = 20) {
  const sql = getDb();
  return sql`
    SELECT ec.*, u.name as author_name, u.avatar_url as author_avatar,
      (SELECT COUNT(*) FROM exchange_collection_items WHERE collection_id = ec.id) as item_count
    FROM exchange_collections ec
    JOIN users u ON ec.user_id = u.id
    WHERE ec.is_public = true
    ORDER BY ec.created_at DESC
    LIMIT ${limit}
  `;
}

export async function getUserCollections(userId: number) {
  const sql = getDb();
  return sql`
    SELECT ec.*,
      (SELECT COUNT(*) FROM exchange_collection_items WHERE collection_id = ec.id) as item_count
    FROM exchange_collections ec
    WHERE ec.user_id = ${userId}
    ORDER BY ec.created_at DESC
  `;
}

export async function deleteCollection(collectionId: number, userId: number) {
  const sql = getDb();
  await sql`DELETE FROM exchange_collections WHERE id = ${collectionId} AND user_id = ${userId}`;
}

// ─── EXCHANGE: REQUESTS ───
export async function createExchangeRequest(userId: number, data: { title: string; description: string; category?: string; platforms?: string[] }) {
  const sql = getDb();
  const result = await sql`
    INSERT INTO exchange_requests (user_id, title, description, category, platforms)
    VALUES (${userId}, ${data.title}, ${data.description}, ${data.category || null}, ${data.platforms || []})
    RETURNING *
  `;
  return result[0];
}

export async function getExchangeRequests(sort = "newest", limit = 50) {
  const sql = getDb();
  if (sort === "most-upvoted") {
    return sql`
      SELECT er.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_requests er
      JOIN users u ON er.user_id = u.id
      WHERE er.status = 'open'
      ORDER BY er.upvote_count DESC, er.created_at DESC
      LIMIT ${limit}
    `;
  }
  return sql`
    SELECT er.*, u.name as author_name, u.avatar_url as author_avatar
    FROM exchange_requests er
    JOIN users u ON er.user_id = u.id
    WHERE er.status = 'open'
    ORDER BY er.created_at DESC
    LIMIT ${limit}
  `;
}

export async function upvoteExchangeRequest(requestId: number, userId: number) {
  const sql = getDb();
  const existing = await sql`SELECT id FROM exchange_request_upvotes WHERE request_id = ${requestId} AND user_id = ${userId}`;
  if (existing.length > 0) {
    // Undo upvote
    await sql`DELETE FROM exchange_request_upvotes WHERE request_id = ${requestId} AND user_id = ${userId}`;
    await sql`UPDATE exchange_requests SET upvote_count = upvote_count - 1 WHERE id = ${requestId}`;
    return false;
  } else {
    await sql`INSERT INTO exchange_request_upvotes (request_id, user_id) VALUES (${requestId}, ${userId})`;
    await sql`UPDATE exchange_requests SET upvote_count = upvote_count + 1 WHERE id = ${requestId}`;
    return true;
  }
}

export async function getUserUpvotes(userId: number) {
  const sql = getDb();
  const rows = await sql`SELECT request_id FROM exchange_request_upvotes WHERE user_id = ${userId}`;
  return rows.map((r: Record<string, unknown>) => r.request_id as number);
}

export async function getRelatedListings(listingId: number, category: string, limit = 4) {
  const sql = getDb();
  return sql`
    SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
    FROM exchange_listings el
    JOIN users u ON el.user_id = u.id
    WHERE el.status = 'approved' AND el.id != ${listingId} AND el.category = ${category}
    ORDER BY el.download_count DESC, el.rating_avg DESC
    LIMIT ${limit}
  `;
}

// ─── EXCHANGE: TRENDING ───
export async function getTrendingExchangeListings(limit = 6) {
  const sql = getDb();
  // Trending = combination of recent downloads + recent rating activity, weighted toward recency
  return sql`
    SELECT el.*, u.name as author_name, u.avatar_url as author_avatar,
      (el.download_count * 0.3 + el.rating_count * 2 + el.rating_avg * 1.5 +
       CASE WHEN el.created_at > NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END +
       CASE WHEN el.created_at > NOW() - INTERVAL '30 days' THEN 5 ELSE 0 END
      ) as trending_score
    FROM exchange_listings el
    JOIN users u ON el.user_id = u.id
    WHERE el.status = 'approved'
    ORDER BY trending_score DESC, el.created_at DESC
    LIMIT ${limit}
  `;
}

export async function getFeaturedExchangeListings(limit = 3) {
  const sql = getDb();
  // Featured = highest rated with minimum 1 review, or newest with most downloads
  return sql`
    SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
    FROM exchange_listings el
    JOIN users u ON el.user_id = u.id
    WHERE el.status = 'approved'
    ORDER BY el.rating_avg DESC, el.download_count DESC
    LIMIT ${limit}
  `;
}

// ─── EXCHANGE: USER PROFILES ───
export async function getExchangeUserProfile(userId: number) {
  const sql = getDb();
  const user = await sql`SELECT id, name, avatar_url, created_at FROM users WHERE id = ${userId}`;
  if (user.length === 0) return null;

  const [listings, stats] = await Promise.all([
    sql`
      SELECT el.*, u.name as author_name, u.avatar_url as author_avatar
      FROM exchange_listings el
      JOIN users u ON el.user_id = u.id
      WHERE el.user_id = ${userId} AND el.status = 'approved'
      ORDER BY el.created_at DESC
    `,
    sql`
      SELECT
        COUNT(*) as total_listings,
        COALESCE(SUM(download_count), 0) as total_downloads,
        COALESCE(AVG(CASE WHEN rating_count > 0 THEN rating_avg ELSE NULL END), 0) as avg_rating,
        COALESCE(SUM(rating_count), 0) as total_reviews
      FROM exchange_listings
      WHERE user_id = ${userId} AND status = 'approved'
    `,
  ]);

  return {
    user: user[0],
    listings: listings.map((l: Record<string, unknown>) => { const { file_data, ...rest } = l; return rest; }),
    stats: {
      totalListings: parseInt(stats[0].total_listings as string),
      totalDownloads: parseInt(stats[0].total_downloads as string),
      avgRating: parseFloat(stats[0].avg_rating as string),
      totalReviews: parseInt(stats[0].total_reviews as string),
    },
  };
}

// ─── AGGREGATE STATS ───
export async function getSignupsPerDay(days = 30) {
  const sql = getDb();
  return sql`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at > ${daysAgo(days)}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
}
