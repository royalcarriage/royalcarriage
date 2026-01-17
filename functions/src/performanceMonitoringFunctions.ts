import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// ============ INTERFACES ============

interface SearchMetrics {
  impressions: number;
  clicks: number;
  avgPosition: number;
  ctr: number;
}

interface EngagementMetrics {
  pageViews: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

interface PerformanceMetric {
  contentId: string;
  websiteId: string;
  locationId: string;
  serviceId: string;
  url: string;
  title: string;
  metricsDate: Date;
  search: SearchMetrics;
  engagement: EngagementMetrics;
  seoScore: number;
  engagementScore: number;
  opportunityScore: number;
}

interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition: number;
  change: number;
  url: string;
  impressions: number;
  clicks: number;
  ctr: number;
  searchVolume: number;
}

interface TrafficData {
  date: string;
  impressions: number;
  clicks: number;
  pageViews: number;
  sessions: number;
  avgPosition: number;
  ctr: number;
}

interface TrendData {
  period: string;
  metrics: {
    impressions: number;
    clicks: number;
    avgPosition: number;
    ctr: number;
    pageViews: number;
    bounceRate: number;
  };
  change: {
    impressions: number;
    clicks: number;
    avgPosition: number;
    ctr: number;
    pageViews: number;
    bounceRate: number;
  };
}

// ============ MAIN FUNCTIONS ============

/**
 * Get performance metrics summary for dashboard
 * Includes overall impressions, clicks, CTR, and top/bottom performers
 */
export const getPerformanceMetrics = functions.https.onCall(
  async (
    data: {
      websiteId?: string;
      locationId?: string;
      dateRange?: "7d" | "30d" | "90d" | "365d";
      limit?: number;
    },
    context,
  ) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role;

    if (
      userRole !== "admin" &&
      userRole !== "superadmin" &&
      userRole !== "viewer"
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Insufficient permissions",
      );
    }

    const { websiteId, locationId, dateRange = "30d", limit = 20 } = data;

    try {
      // Calculate date range
      const now = new Date();
      const daysMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "365d": 365,
      };
      const days = daysMap[dateRange] || 30;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Build query
      let query: FirebaseFirestore.Query = db.collection("performance_metrics");

      if (websiteId) {
        query = query.where("websiteId", "==", websiteId);
      }
      if (locationId) {
        query = query.where("locationId", "==", locationId);
      }

      const snapshot = await query.get();
      const metrics = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (PerformanceMetric & { id: string })[];

      if (metrics.length === 0) {
        return {
          success: true,
          summary: {
            totalImpressions: 0,
            totalClicks: 0,
            avgCtr: 0,
            avgPosition: 0,
            totalPageViews: 0,
            avgBounceRate: 0,
            avgSessionDuration: 0,
            totalPages: 0,
          },
          topPerformers: [],
          needsImprovement: [],
          rankingDistribution: {
            top10: 0,
            top20: 0,
            top50: 0,
            beyond50: 0,
          },
          contentAgeAnalysis: {
            fresh: 0,
            aging: 0,
            stale: 0,
          },
        };
      }

      // Calculate summary statistics
      const totalImpressions = metrics.reduce(
        (sum, m) => sum + (m.search?.impressions || 0),
        0,
      );
      const totalClicks = metrics.reduce(
        (sum, m) => sum + (m.search?.clicks || 0),
        0,
      );
      const avgCtr =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const avgPosition =
        metrics.reduce((sum, m) => sum + (m.search?.avgPosition || 0), 0) /
        metrics.length;
      const totalPageViews = metrics.reduce(
        (sum, m) => sum + (m.engagement?.pageViews || 0),
        0,
      );
      const avgBounceRate =
        metrics.reduce((sum, m) => sum + (m.engagement?.bounceRate || 0), 0) /
        metrics.length;
      const avgSessionDuration =
        metrics.reduce(
          (sum, m) => sum + (m.engagement?.avgSessionDuration || 0),
          0,
        ) / metrics.length;

      // Top performers (by clicks)
      const topPerformers = [...metrics]
        .sort((a, b) => (b.search?.clicks || 0) - (a.search?.clicks || 0))
        .slice(0, limit)
        .map((m) => ({
          contentId: m.contentId,
          url: m.url,
          title: m.title,
          websiteId: m.websiteId,
          locationId: m.locationId,
          impressions: m.search?.impressions || 0,
          clicks: m.search?.clicks || 0,
          ctr: m.search?.ctr || 0,
          avgPosition: m.search?.avgPosition || 0,
          pageViews: m.engagement?.pageViews || 0,
          bounceRate: m.engagement?.bounceRate || 0,
          seoScore: m.seoScore || 0,
        }));

      // Pages needing improvement (high impressions, low clicks OR high bounce rate)
      const needsImprovement = [...metrics]
        .filter(
          (m) =>
            ((m.search?.impressions || 0) > 100 && (m.search?.ctr || 0) < 1) ||
            (m.engagement?.bounceRate || 0) > 70,
        )
        .sort(
          (a, b) => (b.search?.impressions || 0) - (a.search?.impressions || 0),
        )
        .slice(0, limit)
        .map((m) => ({
          contentId: m.contentId,
          url: m.url,
          title: m.title,
          websiteId: m.websiteId,
          locationId: m.locationId,
          impressions: m.search?.impressions || 0,
          clicks: m.search?.clicks || 0,
          ctr: m.search?.ctr || 0,
          avgPosition: m.search?.avgPosition || 0,
          bounceRate: m.engagement?.bounceRate || 0,
          issue:
            (m.search?.ctr || 0) < 1
              ? "Low CTR - improve title/meta description"
              : "High bounce rate - improve content quality",
        }));

      // Ranking distribution
      const rankingDistribution = {
        top10: metrics.filter((m) => (m.search?.avgPosition || 100) <= 10)
          .length,
        top20: metrics.filter(
          (m) =>
            (m.search?.avgPosition || 100) > 10 &&
            (m.search?.avgPosition || 100) <= 20,
        ).length,
        top50: metrics.filter(
          (m) =>
            (m.search?.avgPosition || 100) > 20 &&
            (m.search?.avgPosition || 100) <= 50,
        ).length,
        beyond50: metrics.filter((m) => (m.search?.avgPosition || 100) > 50)
          .length,
      };

      // Content age analysis
      const contentAgeSnapshot = await db
        .collection("content_age_tracking")
        .get();
      const contentAges = contentAgeSnapshot.docs.map((doc) => doc.data());
      const contentAgeAnalysis = {
        fresh: contentAges.filter((c) => (c.ageInDays || 0) <= 30).length,
        aging: contentAges.filter(
          (c) => (c.ageInDays || 0) > 30 && (c.ageInDays || 0) <= 90,
        ).length,
        stale: contentAges.filter((c) => (c.ageInDays || 0) > 90).length,
      };

      return {
        success: true,
        summary: {
          totalImpressions,
          totalClicks,
          avgCtr: Math.round(avgCtr * 100) / 100,
          avgPosition: Math.round(avgPosition * 10) / 10,
          totalPageViews,
          avgBounceRate: Math.round(avgBounceRate * 10) / 10,
          avgSessionDuration: Math.round(avgSessionDuration),
          totalPages: metrics.length,
        },
        topPerformers,
        needsImprovement,
        rankingDistribution,
        contentAgeAnalysis,
      };
    } catch (error: any) {
      console.error("Error fetching performance metrics:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get traffic analytics data by time period and content/location
 */
export const getTrafficAnalytics = functions.https.onCall(
  async (
    data: {
      websiteId?: string;
      locationId?: string;
      serviceId?: string;
      dateRange?: "7d" | "30d" | "90d" | "365d";
      groupBy?: "day" | "week" | "month";
    },
    context,
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const {
      websiteId,
      locationId,
      serviceId,
      dateRange = "30d",
      groupBy = "day",
    } = data;

    try {
      // Calculate date range
      const now = new Date();
      const daysMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "365d": 365,
      };
      const days = daysMap[dateRange] || 30;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Build query for daily traffic data
      let query: FirebaseFirestore.Query = db.collection(
        "daily_traffic_metrics",
      );

      if (websiteId) {
        query = query.where("websiteId", "==", websiteId);
      }
      if (locationId) {
        query = query.where("locationId", "==", locationId);
      }
      if (serviceId) {
        query = query.where("serviceId", "==", serviceId);
      }

      const snapshot = await query.get();
      const rawData = snapshot.docs
        .map((doc) => doc.data())
        .filter((d) => {
          const date = d.date?.toDate?.() || new Date(d.date);
          return date >= startDate;
        });

      // Group data by time period
      const groupedData = groupTrafficData(rawData, groupBy);

      // Calculate traffic by website
      const trafficByWebsite = await calculateTrafficByWebsite(db, startDate);

      // Calculate traffic by location (top 10)
      const trafficByLocation = await calculateTrafficByLocation(
        db,
        startDate,
        10,
      );

      // Calculate traffic by service type
      const trafficByService = await calculateTrafficByService(db, startDate);

      return {
        success: true,
        timeSeries: groupedData,
        trafficByWebsite,
        trafficByLocation,
        trafficByService,
        dateRange,
        groupBy,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      };
    } catch (error: any) {
      console.error("Error fetching traffic analytics:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get keyword rankings with position tracking
 */
export const getKeywordRankings = functions.https.onCall(
  async (
    data: {
      websiteId?: string;
      positionFilter?: "top10" | "top20" | "top50" | "all";
      sortBy?: "position" | "impressions" | "clicks" | "change";
      limit?: number;
    },
    context,
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const {
      websiteId,
      positionFilter = "all",
      sortBy = "impressions",
      limit = 100,
    } = data;

    try {
      // Build query
      let query: FirebaseFirestore.Query = db.collection("keyword_rankings");

      if (websiteId) {
        query = query.where("websiteId", "==", websiteId);
      }

      const snapshot = await query.get();
      let rankings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (KeywordRanking & { id: string })[];

      // Filter by position
      if (positionFilter !== "all") {
        const positionLimits: Record<string, number> = {
          top10: 10,
          top20: 20,
          top50: 50,
        };
        const maxPosition = positionLimits[positionFilter] || 100;
        rankings = rankings.filter((r) => r.position <= maxPosition);
      }

      // Sort rankings
      const sortFunctions: Record<
        string,
        (a: KeywordRanking, b: KeywordRanking) => number
      > = {
        position: (a, b) => a.position - b.position,
        impressions: (a, b) => b.impressions - a.impressions,
        clicks: (a, b) => b.clicks - a.clicks,
        change: (a, b) => b.change - a.change,
      };
      rankings.sort(sortFunctions[sortBy] || sortFunctions.impressions);

      // Limit results
      rankings = rankings.slice(0, limit);

      // Calculate summary stats
      const positionDistribution = {
        top3: rankings.filter((r) => r.position <= 3).length,
        top10: rankings.filter((r) => r.position <= 10).length,
        top20: rankings.filter((r) => r.position > 10 && r.position <= 20)
          .length,
        top50: rankings.filter((r) => r.position > 20 && r.position <= 50)
          .length,
        beyond50: rankings.filter((r) => r.position > 50).length,
      };

      // Movers (biggest position changes)
      const topMoversUp = [...rankings]
        .filter((r) => r.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 10);

      const topMoversDown = [...rankings]
        .filter((r) => r.change < 0)
        .sort((a, b) => a.change - b.change)
        .slice(0, 10);

      // New rankings (position was 0 or null before)
      const newRankings = rankings.filter(
        (r) => r.previousPosition === 0 || !r.previousPosition,
      );

      return {
        success: true,
        keywords: rankings.map((r) => ({
          keyword: r.keyword,
          position: r.position,
          previousPosition: r.previousPosition,
          change: r.change,
          url: r.url,
          impressions: r.impressions,
          clicks: r.clicks,
          ctr: r.ctr,
          searchVolume: r.searchVolume,
          trend: r.change > 0 ? "up" : r.change < 0 ? "down" : "stable",
        })),
        totalKeywords: rankings.length,
        positionDistribution,
        movers: {
          up: topMoversUp,
          down: topMoversDown,
        },
        newRankings: newRankings.slice(0, 10),
      };
    } catch (error: any) {
      console.error("Error fetching keyword rankings:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get historical performance trends for analysis
 */
export const getPerformanceTrends = functions.https.onCall(
  async (
    data: {
      websiteId?: string;
      metric?:
        | "impressions"
        | "clicks"
        | "ctr"
        | "position"
        | "pageViews"
        | "bounceRate";
      compareWith?: "previous_period" | "previous_year";
    },
    context,
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const {
      websiteId,
      metric = "impressions",
      compareWith = "previous_period",
    } = data;

    try {
      // Get trend snapshots
      let query: FirebaseFirestore.Query = db.collection("performance_trends");

      if (websiteId) {
        query = query.where("websiteId", "==", websiteId);
      }

      const snapshot = await query.get();
      const trendData = snapshot.docs.map((doc) => doc.data());

      // Calculate period comparisons
      const now = new Date();

      // Last 7 days vs previous 7 days
      const last7Days = calculatePeriodMetrics(trendData, 7);
      const previous7Days = calculatePeriodMetrics(trendData, 14, 7);

      // Last 30 days vs previous 30 days
      const last30Days = calculatePeriodMetrics(trendData, 30);
      const previous30Days = calculatePeriodMetrics(trendData, 60, 30);

      // Last 90 days vs previous 90 days
      const last90Days = calculatePeriodMetrics(trendData, 90);
      const previous90Days = calculatePeriodMetrics(trendData, 180, 90);

      // Calculate percent changes
      const trends: TrendData[] = [
        {
          period: "7 days",
          metrics: last7Days,
          change: calculatePercentChange(last7Days, previous7Days),
        },
        {
          period: "30 days",
          metrics: last30Days,
          change: calculatePercentChange(last30Days, previous30Days),
        },
        {
          period: "90 days",
          metrics: last90Days,
          change: calculatePercentChange(last90Days, previous90Days),
        },
      ];

      // Get daily trend data for charts
      const dailyTrends = await getDailyTrendData(db, websiteId, 30);

      // Calculate recommendations based on trends
      const recommendations = generateTrendRecommendations(trends, dailyTrends);

      return {
        success: true,
        trends,
        dailyTrends,
        recommendations,
        summary: {
          overallTrend:
            trends[1].change.impressions > 0
              ? "improving"
              : trends[1].change.impressions < 0
                ? "declining"
                : "stable",
          strongestMetric: findStrongestMetric(trends[1].change),
          weakestMetric: findWeakestMetric(trends[1].change),
        },
      };
    } catch (error: any) {
      console.error("Error fetching performance trends:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Sync performance metrics from Google Search Console and Analytics
 * Scheduled to run daily
 */
export const syncPerformanceMetrics = functions.pubsub
  .schedule("0 3 * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    functions.logger.info("Starting daily performance metrics sync...");

    const db = admin.firestore();

    try {
      // In production, this would:
      // 1. Connect to Google Search Console API
      // 2. Connect to Google Analytics API
      // 3. Pull metrics for each tracked URL
      // 4. Update performance_metrics collection
      //
      // For now, we'll create a framework that simulates the sync

      // Get all content items to track
      const contentSnapshot = await db.collection("service_content").get();

      if (contentSnapshot.empty) {
        functions.logger.info("No content to sync metrics for");
        return null;
      }

      const batch = db.batch();
      const timestamp = new Date();

      for (const doc of contentSnapshot.docs) {
        const content = doc.data();

        // In production, fetch real metrics from APIs
        // For now, create placeholder metrics structure
        const metricsRef = db.collection("performance_metrics").doc(doc.id);

        batch.set(
          metricsRef,
          {
            contentId: doc.id,
            websiteId: content.websiteId,
            locationId: content.locationId,
            serviceId: content.serviceId,
            url:
              content.url ||
              `/services/${content.locationId}/${content.serviceId}`,
            title: content.title,
            metricsDate: timestamp,
            search: {
              impressions: 0,
              clicks: 0,
              avgPosition: 0,
              ctr: 0,
            },
            engagement: {
              pageViews: 0,
              sessions: 0,
              avgSessionDuration: 0,
              bounceRate: 0,
              conversionRate: 0,
            },
            seoScore: content.aiQualityScore || 0,
            engagementScore: 0,
            opportunityScore: 0,
            lastSyncedAt: timestamp,
          },
          { merge: true },
        );
      }

      await batch.commit();

      functions.logger.info("Performance metrics sync completed", {
        totalItems: contentSnapshot.size,
      });

      return null;
    } catch (error) {
      functions.logger.error("Performance metrics sync failed:", error);
      throw error;
    }
  });

/**
 * Generate a performance report for a specific period
 */
export const generatePerformanceReport = functions.https.onCall(
  async (
    data: {
      websiteId?: string;
      dateRange: "7d" | "30d" | "90d";
      includeRecommendations?: boolean;
    },
    context,
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role;

    if (userRole !== "admin" && userRole !== "superadmin") {
      throw new functions.https.HttpsError("permission-denied", "Admins only");
    }

    const { websiteId, dateRange, includeRecommendations = true } = data;

    try {
      // Fetch all required data
      const metricsResult = await getPerformanceMetricsInternal(
        db,
        websiteId,
        dateRange,
      );
      const keywordsResult = await getKeywordRankingsInternal(db, websiteId);
      const trendsResult = await getPerformanceTrendsInternal(db, websiteId);

      // Generate report
      const report = {
        reportId: `perf-report-${Date.now()}`,
        generatedAt: new Date(),
        dateRange,
        websiteId: websiteId || "all",

        summary: metricsResult.summary,

        topPages: metricsResult.topPerformers.slice(0, 10),
        underperformingPages: metricsResult.needsImprovement.slice(0, 10),

        keywordHighlights: {
          totalTracked: keywordsResult.totalKeywords,
          inTop10: keywordsResult.positionDistribution.top10,
          inTop20: keywordsResult.positionDistribution.top20,
          topMoversUp: keywordsResult.movers.up.slice(0, 5),
          topMoversDown: keywordsResult.movers.down.slice(0, 5),
        },

        trends: trendsResult.trends,

        recommendations: includeRecommendations
          ? generateComprehensiveRecommendations(
              metricsResult,
              keywordsResult,
              trendsResult,
            )
          : [],
      };

      // Save report
      await db
        .collection("performance_reports")
        .doc(report.reportId)
        .set(report);

      return {
        success: true,
        report,
      };
    } catch (error: any) {
      console.error("Error generating performance report:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

// ============ HELPER FUNCTIONS ============

function groupTrafficData(
  rawData: any[],
  groupBy: "day" | "week" | "month",
): TrafficData[] {
  const grouped = new Map<string, TrafficData>();

  rawData.forEach((item) => {
    const date = item.date?.toDate?.() || new Date(item.date);
    let key: string;

    switch (groupBy) {
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        date: key,
        impressions: 0,
        clicks: 0,
        pageViews: 0,
        sessions: 0,
        avgPosition: 0,
        ctr: 0,
      });
    }

    const existing = grouped.get(key)!;
    existing.impressions += item.impressions || 0;
    existing.clicks += item.clicks || 0;
    existing.pageViews += item.pageViews || 0;
    existing.sessions += item.sessions || 0;
  });

  // Calculate averages
  grouped.forEach((data, key) => {
    if (data.impressions > 0) {
      data.ctr = (data.clicks / data.impressions) * 100;
    }
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

async function calculateTrafficByWebsite(
  db: FirebaseFirestore.Firestore,
  startDate: Date,
): Promise<any[]> {
  const websites = ["airport", "corporate", "wedding", "partyBus"];
  const results: any[] = [];

  for (const websiteId of websites) {
    const snapshot = await db
      .collection("performance_metrics")
      .where("websiteId", "==", websiteId)
      .get();

    const metrics = snapshot.docs.map((doc) => doc.data());
    const totalImpressions = metrics.reduce(
      (sum, m) => sum + (m.search?.impressions || 0),
      0,
    );
    const totalClicks = metrics.reduce(
      (sum, m) => sum + (m.search?.clicks || 0),
      0,
    );
    const totalPageViews = metrics.reduce(
      (sum, m) => sum + (m.engagement?.pageViews || 0),
      0,
    );

    results.push({
      websiteId,
      impressions: totalImpressions,
      clicks: totalClicks,
      pageViews: totalPageViews,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      pages: metrics.length,
    });
  }

  return results.sort((a, b) => b.impressions - a.impressions);
}

async function calculateTrafficByLocation(
  db: FirebaseFirestore.Firestore,
  startDate: Date,
  limit: number,
): Promise<any[]> {
  const snapshot = await db.collection("performance_metrics").get();
  const locationMap = new Map<string, any>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const locationId = data.locationId;

    if (!locationMap.has(locationId)) {
      locationMap.set(locationId, {
        locationId,
        impressions: 0,
        clicks: 0,
        pageViews: 0,
        pages: 0,
      });
    }

    const existing = locationMap.get(locationId)!;
    existing.impressions += data.search?.impressions || 0;
    existing.clicks += data.search?.clicks || 0;
    existing.pageViews += data.engagement?.pageViews || 0;
    existing.pages += 1;
  });

  return Array.from(locationMap.values())
    .map((loc) => ({
      ...loc,
      ctr: loc.impressions > 0 ? (loc.clicks / loc.impressions) * 100 : 0,
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
}

async function calculateTrafficByService(
  db: FirebaseFirestore.Firestore,
  startDate: Date,
): Promise<any[]> {
  const snapshot = await db.collection("performance_metrics").get();
  const serviceMap = new Map<string, any>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const serviceId = data.serviceId;

    if (!serviceMap.has(serviceId)) {
      serviceMap.set(serviceId, {
        serviceId,
        impressions: 0,
        clicks: 0,
        pageViews: 0,
        pages: 0,
      });
    }

    const existing = serviceMap.get(serviceId)!;
    existing.impressions += data.search?.impressions || 0;
    existing.clicks += data.search?.clicks || 0;
    existing.pageViews += data.engagement?.pageViews || 0;
    existing.pages += 1;
  });

  return Array.from(serviceMap.values())
    .map((svc) => ({
      ...svc,
      ctr: svc.impressions > 0 ? (svc.clicks / svc.impressions) * 100 : 0,
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

function calculatePeriodMetrics(
  trendData: any[],
  daysBack: number,
  offsetDays: number = 0,
): any {
  const now = new Date();
  const endDate = new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000);
  const startDate = new Date(
    endDate.getTime() - daysBack * 24 * 60 * 60 * 1000,
  );

  const filtered = trendData.filter((d) => {
    const date = d.date?.toDate?.() || new Date(d.date);
    return date >= startDate && date <= endDate;
  });

  if (filtered.length === 0) {
    return {
      impressions: 0,
      clicks: 0,
      avgPosition: 0,
      ctr: 0,
      pageViews: 0,
      bounceRate: 0,
    };
  }

  const impressions = filtered.reduce(
    (sum, d) => sum + (d.impressions || 0),
    0,
  );
  const clicks = filtered.reduce((sum, d) => sum + (d.clicks || 0), 0);
  const pageViews = filtered.reduce((sum, d) => sum + (d.pageViews || 0), 0);

  return {
    impressions,
    clicks,
    avgPosition:
      filtered.reduce((sum, d) => sum + (d.avgPosition || 0), 0) /
      filtered.length,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    pageViews,
    bounceRate:
      filtered.reduce((sum, d) => sum + (d.bounceRate || 0), 0) /
      filtered.length,
  };
}

function calculatePercentChange(current: any, previous: any): any {
  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return {
    impressions: Math.round(
      calcChange(current.impressions, previous.impressions),
    ),
    clicks: Math.round(calcChange(current.clicks, previous.clicks)),
    avgPosition: Math.round(
      calcChange(previous.avgPosition, current.avgPosition),
    ), // Inverted: lower is better
    ctr: Math.round(calcChange(current.ctr, previous.ctr) * 10) / 10,
    pageViews: Math.round(calcChange(current.pageViews, previous.pageViews)),
    bounceRate: Math.round(calcChange(previous.bounceRate, current.bounceRate)), // Inverted: lower is better
  };
}

async function getDailyTrendData(
  db: FirebaseFirestore.Firestore,
  websiteId: string | undefined,
  days: number,
): Promise<any[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query: FirebaseFirestore.Query = db.collection("daily_traffic_metrics");
  if (websiteId) {
    query = query.where("websiteId", "==", websiteId);
  }

  const snapshot = await query.get();

  return snapshot.docs
    .map((doc) => doc.data())
    .filter((d) => {
      const date = d.date?.toDate?.() || new Date(d.date);
      return date >= startDate;
    })
    .map((d) => ({
      date: (d.date?.toDate?.() || new Date(d.date))
        .toISOString()
        .split("T")[0],
      impressions: d.impressions || 0,
      clicks: d.clicks || 0,
      pageViews: d.pageViews || 0,
      avgPosition: d.avgPosition || 0,
      ctr: d.ctr || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function generateTrendRecommendations(
  trends: TrendData[],
  dailyTrends: any[],
): string[] {
  const recommendations: string[] = [];
  const last30Days = trends.find((t) => t.period === "30 days");

  if (!last30Days) return recommendations;

  // Impressions declining
  if (last30Days.change.impressions < -10) {
    recommendations.push(
      "Impressions are declining. Consider expanding content coverage or improving keyword targeting.",
    );
  }

  // CTR declining
  if (last30Days.change.ctr < -5) {
    recommendations.push(
      "Click-through rate is declining. Review and improve meta titles and descriptions.",
    );
  }

  // Position declining (going up = worse)
  if (last30Days.change.avgPosition < -5) {
    recommendations.push(
      "Average ranking position is declining. Focus on content quality and backlink building.",
    );
  }

  // Bounce rate increasing
  if (last30Days.change.bounceRate < -10) {
    recommendations.push(
      "Bounce rate is increasing. Improve page load speed and content relevance.",
    );
  }

  // Positive trends
  if (last30Days.change.impressions > 20) {
    recommendations.push(
      "Great progress! Impressions are up significantly. Continue current content strategy.",
    );
  }

  if (last30Days.change.clicks > 20) {
    recommendations.push(
      "Clicks are growing well. Consider optimizing for conversions.",
    );
  }

  return recommendations;
}

function findStrongestMetric(changes: any): string {
  const metrics = Object.entries(changes) as [string, number][];
  const strongest = metrics.sort((a, b) => b[1] - a[1])[0];
  return strongest[0];
}

function findWeakestMetric(changes: any): string {
  const metrics = Object.entries(changes) as [string, number][];
  const weakest = metrics.sort((a, b) => a[1] - b[1])[0];
  return weakest[0];
}

// Internal versions of main functions for report generation
async function getPerformanceMetricsInternal(
  db: FirebaseFirestore.Firestore,
  websiteId: string | undefined,
  dateRange: string,
): Promise<any> {
  let query: FirebaseFirestore.Query = db.collection("performance_metrics");
  if (websiteId) {
    query = query.where("websiteId", "==", websiteId);
  }

  const snapshot = await query.get();
  const metrics = snapshot.docs.map((doc) => doc.data());

  const totalImpressions = metrics.reduce(
    (sum, m) => sum + (m.search?.impressions || 0),
    0,
  );
  const totalClicks = metrics.reduce(
    (sum, m) => sum + (m.search?.clicks || 0),
    0,
  );

  return {
    summary: {
      totalImpressions,
      totalClicks,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgPosition:
        metrics.length > 0
          ? metrics.reduce((sum, m) => sum + (m.search?.avgPosition || 0), 0) /
            metrics.length
          : 0,
      totalPages: metrics.length,
    },
    topPerformers: [...metrics]
      .sort((a, b) => (b.search?.clicks || 0) - (a.search?.clicks || 0))
      .slice(0, 20),
    needsImprovement: [...metrics]
      .filter(
        (m) => (m.search?.ctr || 0) < 1 || (m.engagement?.bounceRate || 0) > 70,
      )
      .slice(0, 20),
  };
}

async function getKeywordRankingsInternal(
  db: FirebaseFirestore.Firestore,
  websiteId: string | undefined,
): Promise<any> {
  let query: FirebaseFirestore.Query = db.collection("keyword_rankings");
  if (websiteId) {
    query = query.where("websiteId", "==", websiteId);
  }

  const snapshot = await query.get();
  const rankings = snapshot.docs.map((doc) => doc.data());

  return {
    totalKeywords: rankings.length,
    positionDistribution: {
      top10: rankings.filter((r) => r.position <= 10).length,
      top20: rankings.filter((r) => r.position > 10 && r.position <= 20).length,
    },
    movers: {
      up: [...rankings]
        .filter((r) => r.change > 0)
        .sort((a, b) => b.change - a.change),
      down: [...rankings]
        .filter((r) => r.change < 0)
        .sort((a, b) => a.change - b.change),
    },
  };
}

async function getPerformanceTrendsInternal(
  db: FirebaseFirestore.Firestore,
  websiteId: string | undefined,
): Promise<any> {
  let query: FirebaseFirestore.Query = db.collection("performance_trends");
  if (websiteId) {
    query = query.where("websiteId", "==", websiteId);
  }

  const snapshot = await query.get();
  const trendData = snapshot.docs.map((doc) => doc.data());

  const last30Days = calculatePeriodMetrics(trendData, 30);
  const previous30Days = calculatePeriodMetrics(trendData, 60, 30);

  return {
    trends: [
      {
        period: "30 days",
        metrics: last30Days,
        change: calculatePercentChange(last30Days, previous30Days),
      },
    ],
  };
}

function generateComprehensiveRecommendations(
  metricsResult: any,
  keywordsResult: any,
  trendsResult: any,
): string[] {
  const recommendations: string[] = [];

  // Based on metrics
  if (metricsResult.summary.avgCtr < 2) {
    recommendations.push(
      "Average CTR is below 2%. Improve meta titles and descriptions to increase click-through rates.",
    );
  }

  if (metricsResult.needsImprovement.length > 10) {
    recommendations.push(
      `${metricsResult.needsImprovement.length} pages need improvement. Prioritize high-impression, low-CTR pages.`,
    );
  }

  // Based on keywords
  if (keywordsResult.positionDistribution.top10 < 50) {
    recommendations.push(
      "Less than 50 keywords in top 10. Focus on content optimization and link building.",
    );
  }

  if (keywordsResult.movers.down.length > keywordsResult.movers.up.length) {
    recommendations.push(
      "More keywords declining than improving. Audit content freshness and competitor activity.",
    );
  }

  // Based on trends
  const trend30d = trendsResult.trends.find(
    (t: TrendData) => t.period === "30 days",
  );
  if (trend30d && trend30d.change.impressions < 0) {
    recommendations.push(
      "Search impressions declining. Consider expanding keyword coverage and publishing more content.",
    );
  }

  return recommendations;
}
