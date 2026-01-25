import { db } from '../db/index.js';
import { analytics } from '../db/schema.js';
import { desc, sql, and, gte } from 'drizzle-orm';

export interface AnalyticsEntry {
  id: string;
  page: string;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  device: string | null;
  createdAt: Date;
}

export class AnalyticsModel {
  static async track(data: {
    page: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    referer?: string | undefined;
    country?: string | undefined;
    device?: string | undefined;
  }): Promise<AnalyticsEntry> {
    const result = await db.insert(analytics).values(data).returning();
    return result[0]!;
  }

  static async getStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total page views
    const totalViews = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analytics)
      .where(gte(analytics.createdAt, startDate));

    // Unique visitors (by IP)
    const uniqueVisitors = await db
      .select({ count: sql<number>`count(DISTINCT ${analytics.ipAddress})::int` })
      .from(analytics)
      .where(gte(analytics.createdAt, startDate));

    // Top pages
    const topPages = await db
      .select({
        page: analytics.page,
        views: sql<number>`count(*)::int`,
      })
      .from(analytics)
      .where(gte(analytics.createdAt, startDate))
      .groupBy(analytics.page)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Views by device
    const deviceStats = await db
      .select({
        device: analytics.device,
        count: sql<number>`count(*)::int`,
      })
      .from(analytics)
      .where(gte(analytics.createdAt, startDate))
      .groupBy(analytics.device);

    // Daily views (last 7 days)
    const dailyViews = await db
      .select({
        date: sql<string>`DATE(${analytics.createdAt})`,
        views: sql<number>`count(*)::int`,
      })
      .from(analytics)
      .where(gte(analytics.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE(${analytics.createdAt})`)
      .orderBy(sql`DATE(${analytics.createdAt})`);

    // Top countries
    const topCountries = await db
      .select({
        country: analytics.country,
        count: sql<number>`count(*)::int`,
      })
      .from(analytics)
      .where(
        and(
          gte(analytics.createdAt, startDate),
          sql`${analytics.country} IS NOT NULL`
        )
      )
      .groupBy(analytics.country)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return {
      totalViews: totalViews[0]?.count || 0,
      uniqueVisitors: uniqueVisitors[0]?.count || 0,
      topPages,
      deviceStats,
      dailyViews,
      topCountries,
    };
  }

  static async getRecentVisits(limit = 50): Promise<AnalyticsEntry[]> {
    return await db
      .select()
      .from(analytics)
      .orderBy(desc(analytics.createdAt))
      .limit(limit);
  }
}
