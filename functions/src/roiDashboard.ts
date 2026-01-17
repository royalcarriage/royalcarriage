/**
 * RC-203: ROI Dashboard Enhancements
 * Time-series trends, cohort analysis, forecasting, custom date ranges, export
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface MetricDataPoint {
  date: string;
  value: number;
}

interface TrendAnalysis {
  metric: string;
  period: string;
  dataPoints: MetricDataPoint[];
  trend: "up" | "down" | "stable";
  percentageChange: number;
  average: number;
  min: number;
  max: number;
}

interface CohortData {
  cohortDate: string;
  cohortSize: number;
  retention: Record<string, number>;
  ltv: number;
  averageOrderValue: number;
}

interface Forecast {
  metric: string;
  horizon: number;
  predictions: Array<{
    date: string;
    predicted: number;
    lowerBound: number;
    upperBound: number;
  }>;
  confidence: number;
  method: string;
}

/**
 * Get time-series trend data for metrics
 */
export const getMetricTrends = functions.https.onCall(
  async (data: {
    metric: "revenue" | "bookings" | "adSpend" | "conversions" | "roas";
    startDate: string;
    endDate: string;
    granularity?: "day" | "week" | "month";
  }): Promise<TrendAnalysis> => {
    const { metric, startDate, endDate, granularity = "day" } = data;

    functions.logger.info("Fetching metric trends", {
      metric,
      startDate,
      endDate,
      granularity,
    });

    // Query metrics collection
    const metricsSnapshot = await db
      .collection("metrics")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date")
      .get();

    const dataPoints: MetricDataPoint[] = [];
    const aggregatedData: Record<string, number[]> = {};

    for (const doc of metricsSnapshot.docs) {
      const docData = doc.data();
      let value = 0;

      switch (metric) {
        case "revenue":
          value = docData.revenue || 0;
          break;
        case "bookings":
          value = docData.bookings || docData.conversions || 0;
          break;
        case "adSpend":
          value = docData.spend || docData.adSpend || 0;
          break;
        case "conversions":
          value = docData.conversions || 0;
          break;
        case "roas":
          const spend = docData.spend || 1;
          value = (docData.revenue || 0) / spend;
          break;
      }

      const dateKey = getAggregationKey(docData.date, granularity);
      if (!aggregatedData[dateKey]) {
        aggregatedData[dateKey] = [];
      }
      aggregatedData[dateKey].push(value);
    }

    // Aggregate by granularity
    for (const [date, values] of Object.entries(aggregatedData)) {
      const sum = values.reduce((a, b) => a + b, 0);
      dataPoints.push({
        date,
        value: metric === "roas" ? sum / values.length : sum,
      });
    }

    // Calculate trend statistics
    const values = dataPoints.map((dp) => dp.value);
    const average =
      values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    // Calculate trend direction
    let trend: "up" | "down" | "stable" = "stable";
    let percentageChange = 0;

    if (dataPoints.length >= 2) {
      const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
      const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

      const firstAvg =
        firstHalf.reduce((sum, dp) => sum + dp.value, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, dp) => sum + dp.value, 0) / secondHalf.length;

      percentageChange =
        firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

      if (percentageChange > 5) trend = "up";
      else if (percentageChange < -5) trend = "down";
    }

    return {
      metric,
      period: `${startDate} to ${endDate}`,
      dataPoints,
      trend,
      percentageChange: Math.round(percentageChange * 100) / 100,
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
    };
  },
);

/**
 * Get cohort analysis for customer retention
 */
export const getCohortAnalysis = functions.https.onCall(
  async (data: {
    cohortType: "monthly" | "weekly";
    startDate: string;
    endDate: string;
  }): Promise<CohortData[]> => {
    const { cohortType, startDate, endDate } = data;

    functions.logger.info("Running cohort analysis", {
      cohortType,
      startDate,
      endDate,
    });

    // Get all trips/bookings with customer data
    const tripsSnapshot = await db
      .collection("trips")
      .where("pickupTime", ">=", startDate)
      .where("pickupTime", "<=", endDate)
      .orderBy("pickupTime")
      .get();

    // Group customers by first booking date (cohort)
    const customerCohorts: Record<string, Set<string>> = {};
    const customerFirstBooking: Record<string, string> = {};
    const customerBookings: Record<
      string,
      Array<{ date: string; revenue: number }>
    > = {};

    for (const doc of tripsSnapshot.docs) {
      const trip = doc.data();
      const customerId = trip.customerId;
      const tripDate = trip.pickupTime?.substring(
        0,
        cohortType === "monthly" ? 7 : 10,
      );
      const revenue = trip.fare || trip.totalAmount || 0;

      if (!customerId || !tripDate) continue;

      // Track first booking
      if (
        !customerFirstBooking[customerId] ||
        tripDate < customerFirstBooking[customerId]
      ) {
        customerFirstBooking[customerId] = tripDate;
      }

      // Track all bookings
      if (!customerBookings[customerId]) {
        customerBookings[customerId] = [];
      }
      customerBookings[customerId].push({ date: tripDate, revenue });
    }

    // Build cohorts
    for (const [customerId, firstDate] of Object.entries(
      customerFirstBooking,
    )) {
      const cohortKey = firstDate;
      if (!customerCohorts[cohortKey]) {
        customerCohorts[cohortKey] = new Set();
      }
      customerCohorts[cohortKey].add(customerId);
    }

    // Calculate retention for each cohort
    const cohortResults: CohortData[] = [];

    for (const [cohortDate, customers] of Object.entries(customerCohorts)) {
      const cohortSize = customers.size;
      const retention: Record<string, number> = {};
      let totalLTV = 0;
      let totalOrders = 0;
      let totalRevenue = 0;

      // Calculate retention periods (0, 1, 2, 3... months/weeks after)
      for (let period = 0; period <= 6; period++) {
        const periodDate = addPeriods(cohortDate, period, cohortType);
        let activeInPeriod = 0;

        for (const customerId of customers) {
          const bookings = customerBookings[customerId] || [];
          const hasBookingInPeriod = bookings.some((b) => {
            const bookingPeriod = b.date.substring(
              0,
              cohortType === "monthly" ? 7 : 10,
            );
            return bookingPeriod === periodDate;
          });

          if (hasBookingInPeriod) {
            activeInPeriod++;
          }
        }

        retention[`period_${period}`] =
          cohortSize > 0 ? (activeInPeriod / cohortSize) * 100 : 0;
      }

      // Calculate LTV
      for (const customerId of customers) {
        const bookings = customerBookings[customerId] || [];
        const customerRevenue = bookings.reduce((sum, b) => sum + b.revenue, 0);
        totalLTV += customerRevenue;
        totalOrders += bookings.length;
        totalRevenue += customerRevenue;
      }

      cohortResults.push({
        cohortDate,
        cohortSize,
        retention,
        ltv: cohortSize > 0 ? totalLTV / cohortSize : 0,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      });
    }

    // Sort by cohort date
    cohortResults.sort((a, b) => a.cohortDate.localeCompare(b.cohortDate));

    // Store analysis
    await db.collection("cohort_analyses").add({
      cohortType,
      startDate,
      endDate,
      results: cohortResults,
      analyzedAt: admin.firestore.Timestamp.now(),
    });

    return cohortResults;
  },
);

/**
 * Generate metric forecasts using simple time-series analysis
 */
export const generateForecast = functions.https.onCall(
  async (data: {
    metric: "revenue" | "bookings" | "adSpend";
    horizon: number;
    historicalDays?: number;
  }): Promise<Forecast> => {
    const { metric, horizon, historicalDays = 90 } = data;

    functions.logger.info("Generating forecast", {
      metric,
      horizon,
      historicalDays,
    });

    // Get historical data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - historicalDays);

    const metricsSnapshot = await db
      .collection("metrics")
      .where("date", ">=", startDate.toISOString().split("T")[0])
      .where("date", "<=", endDate.toISOString().split("T")[0])
      .orderBy("date")
      .get();

    const historicalData: MetricDataPoint[] = [];

    for (const doc of metricsSnapshot.docs) {
      const docData = doc.data();
      let value = 0;

      switch (metric) {
        case "revenue":
          value = docData.revenue || 0;
          break;
        case "bookings":
          value = docData.bookings || docData.conversions || 0;
          break;
        case "adSpend":
          value = docData.spend || docData.adSpend || 0;
          break;
      }

      historicalData.push({ date: docData.date, value });
    }

    // Simple moving average forecast with trend
    const values = historicalData.map((d) => d.value);
    const movingAvgWindow = Math.min(7, values.length);

    // Calculate moving average
    const movingAvg =
      values.slice(-movingAvgWindow).reduce((a, b) => a + b, 0) /
      movingAvgWindow;

    // Calculate trend (linear regression slope)
    const n = values.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    const slope =
      n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;

    // Calculate standard deviation for confidence intervals
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Generate predictions
    const predictions: Forecast["predictions"] = [];

    for (let i = 1; i <= horizon; i++) {
      const forecastDate = new Date(endDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      const predicted = movingAvg + slope * i;
      const uncertainty = stdDev * Math.sqrt(i) * 1.96; // 95% confidence

      predictions.push({
        date: forecastDate.toISOString().split("T")[0],
        predicted: Math.max(0, Math.round(predicted * 100) / 100),
        lowerBound: Math.max(
          0,
          Math.round((predicted - uncertainty) * 100) / 100,
        ),
        upperBound: Math.round((predicted + uncertainty) * 100) / 100,
      });
    }

    // Calculate forecast confidence based on data quality
    const dataQualityScore = Math.min(100, (historicalData.length / 90) * 100);
    const trendConsistencyScore =
      stdDev > 0 ? Math.max(0, 100 - (stdDev / mean) * 100) : 50;
    const confidence = Math.round(
      (dataQualityScore + trendConsistencyScore) / 2,
    );

    const forecast: Forecast = {
      metric,
      horizon,
      predictions,
      confidence,
      method: "Moving Average with Linear Trend",
    };

    // Store forecast
    await db.collection("forecasts").add({
      ...forecast,
      historicalDataPoints: historicalData.length,
      generatedAt: admin.firestore.Timestamp.now(),
    });

    return forecast;
  },
);

/**
 * Export dashboard data to CSV/JSON
 */
export const exportDashboardData = functions.https.onCall(
  async (data: {
    metrics: string[];
    startDate: string;
    endDate: string;
    format: "csv" | "json";
  }) => {
    const { metrics, startDate, endDate, format } = data;

    functions.logger.info("Exporting dashboard data", {
      metrics,
      startDate,
      endDate,
      format,
    });

    // Gather data from various collections
    const exportData: Record<string, any[]> = {};

    // Metrics data
    if (metrics.includes("ads") || metrics.includes("all")) {
      const adsSnapshot = await db
        .collection("metrics")
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .orderBy("date")
        .get();

      exportData.adsMetrics = adsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Trips data
    if (metrics.includes("trips") || metrics.includes("all")) {
      const tripsSnapshot = await db
        .collection("trips")
        .where("pickupTime", ">=", startDate)
        .where("pickupTime", "<=", endDate)
        .orderBy("pickupTime")
        .get();

      exportData.trips = tripsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Content quality scores
    if (metrics.includes("content") || metrics.includes("all")) {
      const contentSnapshot = await db
        .collection("content_quality_scores")
        .get();

      exportData.contentScores = contentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Competitor analysis
    if (metrics.includes("competitors") || metrics.includes("all")) {
      const competitorSnapshot = await db
        .collection("competitor_analysis")
        .get();

      exportData.competitorAnalysis = competitorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Format output
    if (format === "csv") {
      const csvParts: string[] = [];

      for (const [collection, data] of Object.entries(exportData)) {
        if (data.length === 0) continue;

        // Get all keys
        const allKeys = new Set<string>();
        data.forEach((row) =>
          Object.keys(row).forEach((key) => allKeys.add(key)),
        );
        const headers = Array.from(allKeys);

        csvParts.push(`# ${collection}`);
        csvParts.push(headers.join(","));

        for (const row of data) {
          const values = headers.map((h) => {
            const val = row[h];
            if (typeof val === "object")
              return JSON.stringify(val).replace(/,/g, ";");
            return String(val || "").replace(/,/g, ";");
          });
          csvParts.push(values.join(","));
        }

        csvParts.push("");
      }

      return {
        format: "csv",
        content: csvParts.join("\n"),
        filename: `dashboard_export_${startDate}_${endDate}.csv`,
      };
    } else {
      return {
        format: "json",
        content: JSON.stringify(exportData, null, 2),
        filename: `dashboard_export_${startDate}_${endDate}.json`,
      };
    }
  },
);

/**
 * Get custom date range metrics summary
 */
export const getDateRangeSummary = functions.https.onCall(
  async (data: { startDate: string; endDate: string }) => {
    const { startDate, endDate } = data;

    functions.logger.info("Getting date range summary", { startDate, endDate });

    // Parallel queries for efficiency
    const [metricsSnapshot, tripsSnapshot, contentSnapshot] = await Promise.all(
      [
        db
          .collection("metrics")
          .where("date", ">=", startDate)
          .where("date", "<=", endDate)
          .get(),
        db
          .collection("trips")
          .where("pickupTime", ">=", startDate)
          .where("pickupTime", "<=", endDate)
          .get(),
        db.collection("content_quality_scores").get(),
      ],
    );

    // Aggregate metrics
    let totalRevenue = 0;
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;

    for (const doc of metricsSnapshot.docs) {
      const data = doc.data();
      totalRevenue += data.revenue || 0;
      totalSpend += data.spend || 0;
      totalImpressions += data.impressions || 0;
      totalClicks += data.clicks || 0;
      totalConversions += data.conversions || 0;
    }

    // Aggregate trips
    const totalTrips = tripsSnapshot.size;
    let totalFare = 0;

    for (const doc of tripsSnapshot.docs) {
      const data = doc.data();
      totalFare += data.fare || data.totalAmount || 0;
    }

    // Aggregate content
    const totalContent = contentSnapshot.size;
    let avgQualityScore = 0;

    if (totalContent > 0) {
      const totalScore = contentSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().overallScore || 0),
        0,
      );
      avgQualityScore = totalScore / totalContent;
    }

    // Calculate derived metrics
    const ctr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

    return {
      period: { startDate, endDate },
      advertising: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalImpressions,
        totalClicks,
        totalConversions,
        ctr: Math.round(ctr * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        cpa: Math.round(cpa * 100) / 100,
      },
      revenue: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        roas: Math.round(roas * 100) / 100,
        totalTrips,
        totalFare: Math.round(totalFare * 100) / 100,
        avgFare:
          totalTrips > 0 ? Math.round((totalFare / totalTrips) * 100) / 100 : 0,
      },
      content: {
        totalContent,
        avgQualityScore: Math.round(avgQualityScore * 100) / 100,
      },
    };
  },
);

// Helper functions
function getAggregationKey(
  date: string,
  granularity: "day" | "week" | "month",
): string {
  const d = new Date(date);

  switch (granularity) {
    case "month":
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    case "week":
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      return startOfWeek.toISOString().split("T")[0];
    case "day":
    default:
      return date.substring(0, 10);
  }
}

function addPeriods(
  dateStr: string,
  periods: number,
  type: "monthly" | "weekly",
): string {
  const date = new Date(dateStr + "-01");

  if (type === "monthly") {
    date.setMonth(date.getMonth() + periods);
    return date.toISOString().substring(0, 7);
  } else {
    date.setDate(date.getDate() + periods * 7);
    return date.toISOString().substring(0, 10);
  }
}
