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
}) {
  const sql = getDb();
  const result = await sql`
    INSERT INTO exchange_listings (user_id, title, slug, description, category, platforms, content, file_name, file_data, file_size)
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
      ${data.file_size || 0}
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
