/**
 * Advanced Analytics Functions - Phase 3
 * Content analytics, ROI analysis, competitor benchmarking, custom reports, and trend forecasting
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ==================== INTERFACES ====================

interface ContentPerformanceMetrics {
  category: string;
  totalPages: number;
  avgQualityScore: number;
  avgEngagement: number;
  totalViews: number;
  totalConversions: number;
  conversionRate: number;
  topPerforming: Array<{
    contentId: string;
    title: string;
    score: number;
    views: number;
    conversions: number;
  }>;
  lowPerforming: Array<{
    contentId: string;
    title: string;
    score: number;
    views: number;
    conversions: number;
  }>;
}

interface ROIMetrics {
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  roiPercentage: number;
  paybackPeriod: number;
  breakdown: {
    adSpend: number;
    contentCreation: number;
    toolsAndSoftware: number;
    laborCosts: number;
  };
  channelROI: Array<{
    channel: string;
    spend: number;
    revenue: number;
    roi: number;
    conversions: number;
    cpa: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    investment: number;
    revenue: number;
    roi: number;
  }>;
}

interface CompetitorBenchmark {
  ourMetrics: {
    avgQualityScore: number;
    totalPages: number;
    estimatedTraffic: number;
    conversionRate: number;
    avgPageSpeed: number;
  };
  industryAverage: {
    avgQualityScore: number;
    totalPages: number;
    estimatedTraffic: number;
    conversionRate: number;
    avgPageSpeed: number;
  };
  competitors: Array<{
    name: string;
    metrics: {
      estimatedTraffic: number;
      pageCount: number;
      contentQuality: string;
      conversionRate: number;
    };
    comparison: {
      trafficDiff: number;
      qualityDiff: string;
      contentGap: number;
    };
  }>;
  rankings: {
    traffic: number;
    quality: number;
    contentVolume: number;
    overall: number;
  };
  recommendations: string[];
}

interface CustomReportConfig {
  name: string;
  metrics: string[];
  dimensions: string[];
  filters: Array<{
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
    value: string | number;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

interface TrendForecast {
  metric: string;
  historicalData: Array<{
    date: string;
    value: number;
  }>;
  forecast: Array<{
    date: string;
    predicted: number;
    lowerBound: number;
    upperBound: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  trendStrength: number;
  seasonality: {
    detected: boolean;
    pattern?: string;
    peakPeriods?: string[];
  };
  insights: string[];
  confidence: number;
}

// ==================== CONTENT ANALYTICS ====================

/**
 * Get content performance analytics by category
 */
export const getContentAnalytics = functions.https.onCall(
  async (data: {
    websiteId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    summary: {
      totalContent: number;
      avgQualityScore: number;
      totalViews: number;
      totalConversions: number;
      overallConversionRate: number;
    };
    byCategory: ContentPerformanceMetrics[];
    trends: Array<{
      date: string;
      views: number;
      conversions: number;
      avgScore: number;
    }>;
  }> => {
    const { websiteId, category, startDate, endDate } = data;

    functions.logger.info('Fetching content analytics', { websiteId, category, startDate, endDate });

    // Build query for content quality scores
    let contentQuery = db.collection('content_quality_scores') as FirebaseFirestore.Query;

    if (websiteId && websiteId !== 'all') {
      contentQuery = contentQuery.where('websiteId', '==', websiteId);
    }

    const contentSnapshot = await contentQuery.get();

    // Build query for content metrics/analytics
    let metricsQuery = db.collection('content_metrics') as FirebaseFirestore.Query;

    if (startDate) {
      metricsQuery = metricsQuery.where('date', '>=', startDate);
    }
    if (endDate) {
      metricsQuery = metricsQuery.where('date', '<=', endDate);
    }

    const metricsSnapshot = await metricsQuery.get();

    // Process content data
    const contentByCategory: Record<string, any[]> = {};
    const categoryMetrics: Record<string, {
      totalViews: number;
      totalConversions: number;
      scores: number[];
      engagements: number[];
    }> = {};

    for (const doc of contentSnapshot.docs) {
      const content = doc.data();
      const cat = content.serviceId || content.category || 'uncategorized';

      if (category && cat !== category) continue;

      if (!contentByCategory[cat]) {
        contentByCategory[cat] = [];
        categoryMetrics[cat] = {
          totalViews: 0,
          totalConversions: 0,
          scores: [],
          engagements: [],
        };
      }

      contentByCategory[cat].push({
        contentId: doc.id,
        title: content.locationId || doc.id,
        score: content.overallScore || 0,
        views: content.views || 0,
        conversions: content.conversions || 0,
        engagement: content.scores?.engagement || 0,
      });

      categoryMetrics[cat].scores.push(content.overallScore || 0);
      categoryMetrics[cat].engagements.push(content.scores?.engagement || 0);
      categoryMetrics[cat].totalViews += content.views || 0;
      categoryMetrics[cat].totalConversions += content.conversions || 0;
    }

    // Build category performance array
    const byCategory: ContentPerformanceMetrics[] = [];
    let totalContent = 0;
    let totalScores = 0;
    let totalViews = 0;
    let totalConversions = 0;

    for (const [cat, items] of Object.entries(contentByCategory)) {
      const metrics = categoryMetrics[cat];
      const avgScore = metrics.scores.length > 0
        ? metrics.scores.reduce((a, b) => a + b, 0) / metrics.scores.length
        : 0;
      const avgEngagement = metrics.engagements.length > 0
        ? metrics.engagements.reduce((a, b) => a + b, 0) / metrics.engagements.length
        : 0;
      const conversionRate = metrics.totalViews > 0
        ? (metrics.totalConversions / metrics.totalViews) * 100
        : 0;

      // Sort for top/low performing
      const sorted = [...items].sort((a, b) => b.score - a.score);

      byCategory.push({
        category: cat,
        totalPages: items.length,
        avgQualityScore: Math.round(avgScore * 10) / 10,
        avgEngagement: Math.round(avgEngagement * 10) / 10,
        totalViews: metrics.totalViews,
        totalConversions: metrics.totalConversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        topPerforming: sorted.slice(0, 5),
        lowPerforming: sorted.slice(-5).reverse(),
      });

      totalContent += items.length;
      totalScores += avgScore * items.length;
      totalViews += metrics.totalViews;
      totalConversions += metrics.totalConversions;
    }

    // Process trends from metrics
    const trendData: Record<string, { views: number; conversions: number; scores: number[] }> = {};

    for (const doc of metricsSnapshot.docs) {
      const metric = doc.data();
      const date = metric.date?.substring(0, 10) || '';

      if (!trendData[date]) {
        trendData[date] = { views: 0, conversions: 0, scores: [] };
      }

      trendData[date].views += metric.views || metric.pageViews || 0;
      trendData[date].conversions += metric.conversions || 0;
      if (metric.qualityScore) {
        trendData[date].scores.push(metric.qualityScore);
      }
    }

    const trends = Object.entries(trendData)
      .map(([date, data]) => ({
        date,
        views: data.views,
        conversions: data.conversions,
        avgScore: data.scores.length > 0
          ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
          : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const avgQualityScore = totalContent > 0 ? totalScores / totalContent : 0;
    const overallConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

    return {
      summary: {
        totalContent,
        avgQualityScore: Math.round(avgQualityScore * 10) / 10,
        totalViews,
        totalConversions,
        overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      },
      byCategory: byCategory.sort((a, b) => b.totalPages - a.totalPages),
      trends,
    };
  }
);

// ==================== ROI ANALYSIS ====================

/**
 * Calculate comprehensive ROI analysis
 */
export const getROIAnalysis = functions.https.onCall(
  async (data: {
    startDate: string;
    endDate: string;
    includeProjectedCosts?: boolean;
  }): Promise<ROIMetrics> => {
    const { startDate, endDate, includeProjectedCosts = false } = data;

    functions.logger.info('Calculating ROI analysis', { startDate, endDate });

    // Fetch ad spend data
    const adsSnapshot = await db
      .collection('metrics')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date')
      .get();

    // Fetch trips/revenue data
    const tripsSnapshot = await db
      .collection('trips')
      .where('pickupTime', '>=', startDate)
      .where('pickupTime', '<=', endDate)
      .get();

    // Fetch cost configuration
    const costConfigDoc = await db.collection('settings').doc('cost_config').get();
    const costConfig = costConfigDoc.exists ? costConfigDoc.data() : {};

    // Calculate totals
    let totalAdSpend = 0;
    let totalRevenue = 0;
    let totalConversions = 0;

    const channelData: Record<string, { spend: number; revenue: number; conversions: number }> = {};
    const monthlyData: Record<string, { investment: number; revenue: number }> = {};

    // Process ad metrics
    for (const doc of adsSnapshot.docs) {
      const metric = doc.data();
      const month = metric.date?.substring(0, 7) || '';
      const channel = metric.platform || metric.channel || 'google';

      totalAdSpend += metric.spend || metric.adSpend || 0;
      totalConversions += metric.conversions || 0;

      if (!channelData[channel]) {
        channelData[channel] = { spend: 0, revenue: 0, conversions: 0 };
      }
      channelData[channel].spend += metric.spend || metric.adSpend || 0;
      channelData[channel].conversions += metric.conversions || 0;

      if (!monthlyData[month]) {
        monthlyData[month] = { investment: 0, revenue: 0 };
      }
      monthlyData[month].investment += metric.spend || metric.adSpend || 0;
    }

    // Process trips for revenue
    for (const doc of tripsSnapshot.docs) {
      const trip = doc.data();
      const fare = trip.fare || trip.totalAmount || 0;
      const month = trip.pickupTime?.substring(0, 7) || '';
      const source = trip.source || trip.leadSource || 'organic';

      totalRevenue += fare;

      // Attribute revenue to channels
      if (channelData[source]) {
        channelData[source].revenue += fare;
      } else if (source.includes('google') && channelData['google']) {
        channelData['google'].revenue += fare;
      } else if (source.includes('facebook') && channelData['facebook']) {
        channelData['facebook'].revenue += fare;
      }

      if (monthlyData[month]) {
        monthlyData[month].revenue += fare;
      }
    }

    // Calculate other costs
    const contentCreationCost = costConfig?.contentCreation || 0;
    const toolsCost = costConfig?.toolsAndSoftware || 0;
    const laborCost = costConfig?.laborCosts || 0;

    const totalInvestment = totalAdSpend + contentCreationCost + toolsCost + laborCost;
    const netProfit = totalRevenue - totalInvestment;
    const roi = totalInvestment > 0 ? netProfit / totalInvestment : 0;
    const roiPercentage = roi * 100;

    // Calculate payback period (months to recover investment)
    const monthlyRevenue = totalRevenue / (Object.keys(monthlyData).length || 1);
    const paybackPeriod = monthlyRevenue > 0 ? totalInvestment / monthlyRevenue : 0;

    // Build channel ROI array
    const channelROI = Object.entries(channelData).map(([channel, data]) => ({
      channel,
      spend: Math.round(data.spend * 100) / 100,
      revenue: Math.round(data.revenue * 100) / 100,
      roi: data.spend > 0 ? Math.round(((data.revenue - data.spend) / data.spend) * 100) / 100 : 0,
      conversions: data.conversions,
      cpa: data.conversions > 0 ? Math.round((data.spend / data.conversions) * 100) / 100 : 0,
    }));

    // Build monthly trend
    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        investment: Math.round(data.investment * 100) / 100,
        revenue: Math.round(data.revenue * 100) / 100,
        roi: data.investment > 0
          ? Math.round(((data.revenue - data.investment) / data.investment) * 100) / 100
          : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Store ROI analysis for historical tracking
    await db.collection('roi_analyses').add({
      startDate,
      endDate,
      totalInvestment,
      totalRevenue,
      roi: roiPercentage,
      analyzedAt: admin.firestore.Timestamp.now(),
    });

    return {
      totalInvestment: Math.round(totalInvestment * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      roiPercentage: Math.round(roiPercentage * 10) / 10,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      breakdown: {
        adSpend: Math.round(totalAdSpend * 100) / 100,
        contentCreation: contentCreationCost,
        toolsAndSoftware: toolsCost,
        laborCosts: laborCost,
      },
      channelROI: channelROI.sort((a, b) => b.roi - a.roi),
      monthlyTrend,
    };
  }
);

// ==================== COMPETITOR BENCHMARK ====================

/**
 * Get competitor benchmarking data
 */
export const getCompetitorBenchmark = functions.https.onCall(
  async (data: {
    websiteId?: string;
    includeHistorical?: boolean;
  }): Promise<CompetitorBenchmark> => {
    const { websiteId, includeHistorical = false } = data;

    functions.logger.info('Fetching competitor benchmark', { websiteId });

    // Get our content quality data
    const contentSnapshot = await db.collection('content_quality_scores').get();

    // Get competitor analysis data
    const competitorSnapshot = await db
      .collection('competitor_analysis')
      .orderBy('analysisDate', 'desc')
      .limit(1)
      .get();

    // Get site metrics
    const siteMetricsDoc = await db.collection('settings').doc('site_metrics').get();
    const siteMetrics = siteMetricsDoc.exists ? siteMetricsDoc.data() : {};

    // Calculate our metrics
    const ourScores = contentSnapshot.docs.map(doc => doc.data().overallScore || 0);
    const ourAvgScore = ourScores.length > 0
      ? ourScores.reduce((a, b) => a + b, 0) / ourScores.length
      : 0;

    const ourMetrics = {
      avgQualityScore: Math.round(ourAvgScore * 10) / 10,
      totalPages: contentSnapshot.size,
      estimatedTraffic: siteMetrics?.monthlyTraffic || 0,
      conversionRate: siteMetrics?.conversionRate || 0,
      avgPageSpeed: siteMetrics?.pageSpeed || 0,
    };

    // Get competitor data
    const competitorData = !competitorSnapshot.empty
      ? competitorSnapshot.docs[0].data()
      : null;

    const competitors: CompetitorBenchmark['competitors'] = [];

    if (competitorData?.competitors) {
      for (const comp of competitorData.competitors) {
        competitors.push({
          name: comp.name,
          metrics: {
            estimatedTraffic: comp.metrics?.estimatedTraffic || 0,
            pageCount: comp.topKeywords?.length || 0,
            contentQuality: comp.metrics?.contentQuality || 'Unknown',
            conversionRate: comp.metrics?.conversionRate || 0,
          },
          comparison: {
            trafficDiff: ourMetrics.estimatedTraffic - (comp.metrics?.estimatedTraffic || 0),
            qualityDiff: ourMetrics.avgQualityScore > 70 ? 'Higher' : 'Lower',
            contentGap: ourMetrics.totalPages - (comp.topKeywords?.length || 0),
          },
        });
      }
    }

    // Calculate industry averages (from competitor data)
    const allCompTraffic = competitors.map(c => c.metrics.estimatedTraffic);
    const allCompPages = competitors.map(c => c.metrics.pageCount);

    const industryAverage = {
      avgQualityScore: 72, // Industry benchmark
      totalPages: allCompPages.length > 0
        ? Math.round(allCompPages.reduce((a, b) => a + b, 0) / allCompPages.length)
        : 50,
      estimatedTraffic: allCompTraffic.length > 0
        ? Math.round(allCompTraffic.reduce((a, b) => a + b, 0) / allCompTraffic.length)
        : 5000,
      conversionRate: 2.5,
      avgPageSpeed: 3.2,
    };

    // Calculate rankings
    const allTraffic = [...allCompTraffic, ourMetrics.estimatedTraffic].sort((a, b) => b - a);
    const allPages = [...allCompPages, ourMetrics.totalPages].sort((a, b) => b - a);

    const rankings = {
      traffic: allTraffic.indexOf(ourMetrics.estimatedTraffic) + 1,
      quality: ourMetrics.avgQualityScore >= industryAverage.avgQualityScore ? 1 : 2,
      contentVolume: allPages.indexOf(ourMetrics.totalPages) + 1,
      overall: 0,
    };
    rankings.overall = Math.round((rankings.traffic + rankings.quality + rankings.contentVolume) / 3);

    // Generate recommendations
    const recommendations: string[] = [];

    if (ourMetrics.avgQualityScore < industryAverage.avgQualityScore) {
      recommendations.push('Improve content quality scores - currently below industry average');
    }
    if (ourMetrics.estimatedTraffic < industryAverage.estimatedTraffic) {
      recommendations.push('Focus on SEO to increase organic traffic');
    }
    if (ourMetrics.totalPages < industryAverage.totalPages) {
      recommendations.push('Create more content pages to expand keyword coverage');
    }
    if (ourMetrics.conversionRate < industryAverage.conversionRate) {
      recommendations.push('Optimize landing pages to improve conversion rate');
    }
    if (competitors.some(c => c.comparison.contentGap < 0)) {
      recommendations.push('Address content gaps - competitors have more pages');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is above industry average - maintain current strategy');
    }

    // Store benchmark
    await db.collection('competitor_benchmarks').add({
      ourMetrics,
      industryAverage,
      rankings,
      competitorCount: competitors.length,
      analyzedAt: admin.firestore.Timestamp.now(),
    });

    return {
      ourMetrics,
      industryAverage,
      competitors,
      rankings,
      recommendations,
    };
  }
);

// ==================== CUSTOM REPORT BUILDER ====================

/**
 * Generate custom reports based on configuration
 */
export const generateCustomReport = functions.https.onCall(
  async (config: CustomReportConfig): Promise<{
    reportId: string;
    name: string;
    generatedAt: string;
    config: CustomReportConfig;
    data: any[];
    summary: Record<string, number>;
    chartData: Array<{ label: string; value: number }>;
  }> => {
    const { name, metrics, dimensions, filters, dateRange, groupBy, sortBy, sortOrder, limit } = config;

    functions.logger.info('Generating custom report', { name, metrics, dimensions });

    // Determine which collection to query based on metrics
    const collectionMap: Record<string, string> = {
      revenue: 'metrics',
      adSpend: 'metrics',
      conversions: 'metrics',
      impressions: 'metrics',
      clicks: 'metrics',
      qualityScore: 'content_quality_scores',
      pageViews: 'content_metrics',
      trips: 'trips',
      bookings: 'trips',
    };

    const primaryMetric = metrics[0] || 'revenue';
    const collectionName = collectionMap[primaryMetric] || 'metrics';

    // Build query
    let query = db.collection(collectionName) as FirebaseFirestore.Query;

    // Apply date range
    if (dateRange.startDate && collectionName === 'metrics') {
      query = query.where('date', '>=', dateRange.startDate);
    }
    if (dateRange.endDate && collectionName === 'metrics') {
      query = query.where('date', '<=', dateRange.endDate);
    }
    if (dateRange.startDate && collectionName === 'trips') {
      query = query.where('pickupTime', '>=', dateRange.startDate);
    }
    if (dateRange.endDate && collectionName === 'trips') {
      query = query.where('pickupTime', '<=', dateRange.endDate);
    }

    const snapshot = await query.get();

    // Process data
    let results: any[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const row: any = { id: doc.id };

      // Extract requested metrics
      for (const metric of metrics) {
        switch (metric) {
          case 'revenue':
            row.revenue = data.revenue || data.fare || data.totalAmount || 0;
            break;
          case 'adSpend':
            row.adSpend = data.spend || data.adSpend || 0;
            break;
          case 'conversions':
            row.conversions = data.conversions || 0;
            break;
          case 'impressions':
            row.impressions = data.impressions || 0;
            break;
          case 'clicks':
            row.clicks = data.clicks || 0;
            break;
          case 'qualityScore':
            row.qualityScore = data.overallScore || 0;
            break;
          case 'pageViews':
            row.pageViews = data.views || data.pageViews || 0;
            break;
          case 'trips':
          case 'bookings':
            row.bookings = 1;
            break;
          default:
            row[metric] = data[metric] || 0;
        }
      }

      // Extract requested dimensions
      for (const dim of dimensions) {
        row[dim] = data[dim] || data[dim.toLowerCase()] || 'Unknown';
      }

      results.push(row);
    }

    // Apply filters
    for (const filter of filters) {
      results = results.filter(row => {
        const value = row[filter.field];
        switch (filter.operator) {
          case 'eq': return value === filter.value;
          case 'gt': return value > filter.value;
          case 'lt': return value < filter.value;
          case 'gte': return value >= filter.value;
          case 'lte': return value <= filter.value;
          case 'contains': return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          default: return true;
        }
      });
    }

    // Group by dimension if specified
    if (groupBy) {
      const grouped: Record<string, any> = {};

      for (const row of results) {
        const key = row[groupBy] || 'Unknown';
        if (!grouped[key]) {
          grouped[key] = { [groupBy]: key };
          for (const metric of metrics) {
            grouped[key][metric] = 0;
          }
          grouped[key].count = 0;
        }

        for (const metric of metrics) {
          grouped[key][metric] += row[metric] || 0;
        }
        grouped[key].count++;
      }

      results = Object.values(grouped);
    }

    // Sort
    if (sortBy) {
      results.sort((a, b) => {
        const aVal = a[sortBy] || 0;
        const bVal = b[sortBy] || 0;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }

    // Limit
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    // Calculate summary
    const summary: Record<string, number> = {};
    for (const metric of metrics) {
      summary[metric] = results.reduce((sum, row) => sum + (row[metric] || 0), 0);
      summary[`avg_${metric}`] = results.length > 0 ? summary[metric] / results.length : 0;
    }
    summary.totalRows = results.length;

    // Build chart data
    const chartData = results.slice(0, 10).map(row => ({
      label: row[groupBy || dimensions[0]] || row.id || 'Unknown',
      value: row[metrics[0]] || 0,
    }));

    // Store report
    const reportRef = await db.collection('custom_reports').add({
      name,
      config,
      summary,
      rowCount: results.length,
      generatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      reportId: reportRef.id,
      name,
      generatedAt: new Date().toISOString(),
      config,
      data: results,
      summary,
      chartData,
    };
  }
);

// ==================== ANALYTICS TRENDS & FORECASTING ====================

/**
 * Get analytics trends with forecasting
 */
export const getAnalyticsTrends = functions.https.onCall(
  async (data: {
    metric: 'revenue' | 'conversions' | 'traffic' | 'qualityScore' | 'bookings';
    historicalDays?: number;
    forecastDays?: number;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<TrendForecast> => {
    const { metric, historicalDays = 90, forecastDays = 30, granularity = 'day' } = data;

    functions.logger.info('Calculating analytics trends', { metric, historicalDays, forecastDays });

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - historicalDays);

    // Determine collection and field
    let collectionName = 'metrics';
    let valueField = 'revenue';

    switch (metric) {
      case 'revenue':
        collectionName = 'metrics';
        valueField = 'revenue';
        break;
      case 'conversions':
        collectionName = 'metrics';
        valueField = 'conversions';
        break;
      case 'traffic':
        collectionName = 'metrics';
        valueField = 'impressions';
        break;
      case 'qualityScore':
        collectionName = 'content_quality_scores';
        valueField = 'overallScore';
        break;
      case 'bookings':
        collectionName = 'trips';
        valueField = 'count';
        break;
    }

    // Fetch historical data
    let query = db.collection(collectionName) as FirebaseFirestore.Query;

    if (collectionName === 'metrics') {
      query = query
        .where('date', '>=', startDate.toISOString().split('T')[0])
        .where('date', '<=', endDate.toISOString().split('T')[0])
        .orderBy('date');
    } else if (collectionName === 'trips') {
      query = query
        .where('pickupTime', '>=', startDate.toISOString().split('T')[0])
        .where('pickupTime', '<=', endDate.toISOString().split('T')[0])
        .orderBy('pickupTime');
    }

    const snapshot = await query.get();

    // Aggregate by date
    const dailyData: Record<string, number[]> = {};

    for (const doc of snapshot.docs) {
      const docData = doc.data();
      let date = '';
      let value = 0;

      if (collectionName === 'trips') {
        date = docData.pickupTime?.substring(0, 10) || '';
        value = 1; // Count trips
      } else if (collectionName === 'content_quality_scores') {
        date = docData.scoredAt?.toDate?.()?.toISOString()?.substring(0, 10) ||
               new Date().toISOString().substring(0, 10);
        value = docData.overallScore || 0;
      } else {
        date = docData.date?.substring(0, 10) || '';
        value = docData[valueField] || 0;
      }

      if (date) {
        const aggKey = getAggregationKey(date, granularity);
        if (!dailyData[aggKey]) {
          dailyData[aggKey] = [];
        }
        dailyData[aggKey].push(value);
      }
    }

    // Build historical data array
    const historicalData: Array<{ date: string; value: number }> = [];

    for (const [date, values] of Object.entries(dailyData)) {
      const aggregatedValue = metric === 'qualityScore'
        ? values.reduce((a, b) => a + b, 0) / values.length  // Average for scores
        : values.reduce((a, b) => a + b, 0);  // Sum for counts

      historicalData.push({
        date,
        value: Math.round(aggregatedValue * 100) / 100,
      });
    }

    historicalData.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate trend and forecast using linear regression
    const values = historicalData.map(d => d.value);
    const n = values.length;

    if (n < 2) {
      return {
        metric,
        historicalData,
        forecast: [],
        trend: 'stable',
        trendStrength: 0,
        seasonality: { detected: false },
        insights: ['Insufficient data for trend analysis'],
        confidence: 0,
      };
    }

    // Linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate standard deviation for confidence intervals
    const mean = sumY / n;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Determine trend
    let trend: TrendForecast['trend'] = 'stable';
    const trendThreshold = mean * 0.02; // 2% of mean

    if (slope > trendThreshold) {
      trend = 'increasing';
    } else if (slope < -trendThreshold) {
      trend = 'decreasing';
    }

    // Check for volatility
    const coeffOfVariation = mean > 0 ? (stdDev / mean) * 100 : 0;
    if (coeffOfVariation > 50) {
      trend = 'volatile';
    }

    const trendStrength = Math.min(100, Math.abs(slope / (mean || 1)) * 1000);

    // Generate forecast
    const forecast: TrendForecast['forecast'] = [];
    const lastDate = new Date(historicalData[historicalData.length - 1]?.date || endDate);

    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(lastDate);

      if (granularity === 'day') {
        forecastDate.setDate(forecastDate.getDate() + i);
      } else if (granularity === 'week') {
        forecastDate.setDate(forecastDate.getDate() + (i * 7));
      } else {
        forecastDate.setMonth(forecastDate.getMonth() + i);
      }

      const predicted = intercept + slope * (n + i - 1);
      const uncertainty = stdDev * Math.sqrt(1 + (1/n) + Math.pow(i - n/2, 2) / (n * variance || 1)) * 1.96;

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predicted: Math.max(0, Math.round(predicted * 100) / 100),
        lowerBound: Math.max(0, Math.round((predicted - uncertainty) * 100) / 100),
        upperBound: Math.round((predicted + uncertainty) * 100) / 100,
      });
    }

    // Detect seasonality (simple weekly pattern check)
    const weeklyAverages: number[] = [0, 0, 0, 0, 0, 0, 0];
    const weeklyCount: number[] = [0, 0, 0, 0, 0, 0, 0];

    for (const item of historicalData) {
      const dayOfWeek = new Date(item.date).getDay();
      weeklyAverages[dayOfWeek] += item.value;
      weeklyCount[dayOfWeek]++;
    }

    for (let i = 0; i < 7; i++) {
      weeklyAverages[i] = weeklyCount[i] > 0 ? weeklyAverages[i] / weeklyCount[i] : 0;
    }

    const weeklyVariance = weeklyAverages.reduce((sum, avg) => sum + Math.pow(avg - mean, 2), 0) / 7;
    const seasonalityDetected = weeklyVariance > (variance * 0.1);

    const peakDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDayIndex = weeklyAverages.indexOf(Math.max(...weeklyAverages));

    // Generate insights
    const insights: string[] = [];

    if (trend === 'increasing') {
      insights.push(`${metric} is trending upward with ${trendStrength.toFixed(0)}% strength`);
    } else if (trend === 'decreasing') {
      insights.push(`${metric} is trending downward - investigate potential causes`);
    } else if (trend === 'volatile') {
      insights.push(`${metric} shows high volatility - consider stabilization strategies`);
    } else {
      insights.push(`${metric} is stable with minimal change`);
    }

    if (seasonalityDetected) {
      insights.push(`Peak performance typically occurs on ${peakDays[peakDayIndex]}s`);
    }

    if (forecast.length > 0) {
      const lastForecast = forecast[forecast.length - 1];
      const currentValue = values[values.length - 1] || 0;
      const predictedChange = ((lastForecast.predicted - currentValue) / (currentValue || 1)) * 100;
      insights.push(`Projected ${predictedChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(predictedChange).toFixed(1)}% over next ${forecastDays} ${granularity}s`);
    }

    // Calculate confidence score
    const dataQualityScore = Math.min(100, (n / historicalDays) * 100);
    const trendConsistencyScore = trend !== 'volatile' ? 70 : 30;
    const confidence = Math.round((dataQualityScore + trendConsistencyScore) / 2);

    // Store trend analysis
    await db.collection('trend_analyses').add({
      metric,
      trend,
      trendStrength,
      confidence,
      forecastDays,
      analyzedAt: admin.firestore.Timestamp.now(),
    });

    return {
      metric,
      historicalData,
      forecast,
      trend,
      trendStrength: Math.round(trendStrength * 10) / 10,
      seasonality: {
        detected: seasonalityDetected,
        pattern: seasonalityDetected ? 'weekly' : undefined,
        peakPeriods: seasonalityDetected ? [peakDays[peakDayIndex]] : undefined,
      },
      insights,
      confidence,
    };
  }
);

// ==================== HELPER FUNCTIONS ====================

function getAggregationKey(date: string, granularity: 'day' | 'week' | 'month'): string {
  const d = new Date(date);

  switch (granularity) {
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    case 'week':
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      return startOfWeek.toISOString().split('T')[0];
    case 'day':
    default:
      return date.substring(0, 10);
  }
}
