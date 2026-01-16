#!/usr/bin/env node

/**
 * Royal Carriage Limousine - Weekly ROI Report Generator
 *
 * Generates markdown report with:
 * - Revenue, spend, profit proxy
 * - Week-over-week changes
 * - Top performing pages
 * - Issues and alerts
 *
 * Output: /reports/weekly-roi-YYYY-MM-DD.md
 *
 * Usage:
 *   node scripts/generate-weekly-report.mjs
 *   npm run report:weekly
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

// Initialize Firebase Admin
// TODO: Configure with proper service account credentials
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "royalcarriagelimoseo",
    });
  } catch (error) {
    console.warn(
      "Firebase Admin initialization skipped (emulator mode or credentials not configured)",
    );
  }
}

const db = admin.firestore();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get date range for current and previous week
 */
function getWeekRanges() {
  const today = new Date();
  const currentWeekEnd = new Date(today);
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - 7);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(currentWeekStart);

  return {
    current: { start: currentWeekStart, end: currentWeekEnd },
    previous: { start: previousWeekStart, end: previousWeekEnd },
  };
}

/**
 * Format number as currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Calculate percentage change
 */
function calculateChange(current, previous) {
  if (previous === 0) return { value: 0, percentage: 0 };
  const change = current - previous;
  const percentage = (change / previous) * 100;
  return { value: change, percentage };
}

/**
 * Format percentage change with arrow
 */
function formatChange(change) {
  const sign = change.percentage >= 0 ? "+" : "";
  const arrow = change.percentage >= 0 ? "↑" : "↓";
  return `${sign}${change.percentage.toFixed(1)}% ${arrow} (${formatCurrency(change.value)})`;
}

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch booking data from Firestore
 * TODO: Replace with actual Firestore query
 */
async function fetchBookingData(startDate, endDate) {
  try {
    // TODO: Query bookings collection
    // const bookingsRef = db.collection('bookings');
    // const snapshot = await bookingsRef
    //   .where('createdAt', '>=', startDate)
    //   .where('createdAt', '<=', endDate)
    //   .get();

    // Mock data for skeleton implementation
    return {
      totalRevenue: Math.random() * 50000 + 20000,
      bookingCount: Math.floor(Math.random() * 50) + 20,
      avgBookingValue: 0, // Will be calculated
      topServices: [
        { name: "Airport Transfer", revenue: 15000, count: 25 },
        { name: "Corporate Event", revenue: 12000, count: 8 },
        { name: "Wedding", revenue: 8000, count: 5 },
      ],
    };
  } catch (error) {
    console.error("Error fetching booking data:", error);
    return null;
  }
}

/**
 * Fetch ads spend data from Firestore
 * TODO: Replace with actual Firestore query
 */
async function fetchAdsData(startDate, endDate) {
  try {
    // TODO: Query ads_imports collection
    // const adsRef = db.collection('ads_imports');
    // const snapshot = await adsRef
    //   .where('date', '>=', startDate)
    //   .where('date', '<=', endDate)
    //   .get();

    // Mock data for skeleton implementation
    return {
      totalSpend: Math.random() * 5000 + 2000,
      clicks: Math.floor(Math.random() * 500) + 200,
      impressions: Math.floor(Math.random() * 10000) + 5000,
      conversions: Math.floor(Math.random() * 30) + 10,
      topKeywords: [
        { keyword: "chicago airport limo", spend: 800, conversions: 5 },
        { keyword: "ohare car service", spend: 600, conversions: 4 },
        { keyword: "corporate transportation", spend: 500, conversions: 3 },
      ],
    };
  } catch (error) {
    console.error("Error fetching ads data:", error);
    return null;
  }
}

/**
 * Fetch top performing pages
 * TODO: Replace with actual Firestore query from gsc_pages collection
 */
async function fetchTopPages() {
  try {
    // TODO: Query gsc_pages collection
    // const pagesRef = db.collection('gsc_pages');
    // const snapshot = await pagesRef
    //   .orderBy('clicks', 'desc')
    //   .limit(10)
    //   .get();

    // Mock data for skeleton implementation
    return [
      {
        page: "/ohare-airport-limo",
        clicks: 450,
        impressions: 8200,
        position: 3.2,
      },
      {
        page: "/midway-airport-limo",
        clicks: 380,
        impressions: 6500,
        position: 4.1,
      },
      {
        page: "/corporate-car-service",
        clicks: 320,
        impressions: 5800,
        position: 3.8,
      },
      {
        page: "/wedding-limo-service",
        clicks: 280,
        impressions: 4900,
        position: 4.5,
      },
      { page: "/", clicks: 250, impressions: 7500, position: 5.2 },
    ];
  } catch (error) {
    console.error("Error fetching top pages:", error);
    return [];
  }
}

/**
 * Identify issues and alerts
 */
async function identifyIssues(currentData, previousData) {
  const issues = [];

  // Check for significant revenue drop
  if (currentData.revenue < previousData.revenue * 0.9) {
    issues.push({
      severity: "high",
      message: "Revenue dropped by more than 10% week-over-week",
      action: "Review marketing campaigns and conversion funnel",
    });
  }

  // Check for increasing spend with decreasing conversions
  const currentROAS = currentData.revenue / currentData.spend;
  const previousROAS = previousData.revenue / previousData.spend;
  if (currentROAS < previousROAS * 0.85) {
    issues.push({
      severity: "medium",
      message: "ROAS decreased significantly",
      action: "Analyze keyword performance and adjust bids",
    });
  }

  // Check for low conversion rate
  const conversionRate = (currentData.conversions / currentData.clicks) * 100;
  if (conversionRate < 5) {
    issues.push({
      severity: "medium",
      message: `Low conversion rate: ${conversionRate.toFixed(1)}%`,
      action: "Review landing page experience and booking flow",
    });
  }

  // TODO: Add more issue detection logic

  return issues;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate markdown report
 */
function generateReport(data) {
  const { current, previous, weekRanges, topPages, issues } = data;

  const revenueChange = calculateChange(current.revenue, previous.revenue);
  const spendChange = calculateChange(current.spend, previous.spend);
  const profitCurrent = current.revenue - current.spend;
  const profitPrevious = previous.revenue - previous.spend;
  const profitChange = calculateChange(profitCurrent, profitPrevious);

  const currentROAS = current.revenue / current.spend;
  const previousROAS = previous.revenue / previous.spend;

  const reportDate = new Date().toISOString().split("T")[0];

  let markdown = `# Weekly ROI Report - ${reportDate}\n\n`;
  markdown += `**Report Period:** ${weekRanges.current.start.toLocaleDateString()} - ${weekRanges.current.end.toLocaleDateString()}\n\n`;
  markdown += `---\n\n`;

  // Executive Summary
  markdown += `## 📊 Executive Summary\n\n`;
  markdown += `| Metric | Current Week | Previous Week | Change |\n`;
  markdown += `|--------|--------------|---------------|--------|\n`;
  markdown += `| **Revenue** | ${formatCurrency(current.revenue)} | ${formatCurrency(previous.revenue)} | ${formatChange(revenueChange)} |\n`;
  markdown += `| **Ad Spend** | ${formatCurrency(current.spend)} | ${formatCurrency(previous.spend)} | ${formatChange(spendChange)} |\n`;
  markdown += `| **Profit Proxy** | ${formatCurrency(profitCurrent)} | ${formatCurrency(profitPrevious)} | ${formatChange(profitChange)} |\n`;
  markdown += `| **ROAS** | ${currentROAS.toFixed(2)}x | ${previousROAS.toFixed(2)}x | ${(((currentROAS - previousROAS) / previousROAS) * 100).toFixed(1)}% |\n`;
  markdown += `| **Conversions** | ${current.conversions} | ${previous.conversions} | ${current.conversions - previous.conversions} |\n\n`;

  // Top Performing Pages
  markdown += `## 🚀 Top Performing Pages\n\n`;
  markdown += `| Page | Clicks | Impressions | Avg Position |\n`;
  markdown += `|------|--------|-------------|-------------|\n`;
  topPages.forEach((page) => {
    markdown += `| ${page.page} | ${page.clicks} | ${page.impressions.toLocaleString()} | ${page.position.toFixed(1)} |\n`;
  });
  markdown += `\n`;

  // Issues and Alerts
  if (issues.length > 0) {
    markdown += `## ⚠️ Issues and Alerts\n\n`;
    issues.forEach((issue) => {
      const emoji =
        issue.severity === "high"
          ? "🔴"
          : issue.severity === "medium"
            ? "🟡"
            : "🟢";
      markdown += `${emoji} **${issue.message}**\n`;
      markdown += `   - Action: ${issue.action}\n\n`;
    });
  } else {
    markdown += `## ✅ No Issues Detected\n\n`;
    markdown += `All metrics are performing within normal ranges.\n\n`;
  }

  // Recommendations
  markdown += `## 💡 Recommendations\n\n`;
  markdown += `1. **Scale Top Performers**: Increase budget for pages with high ROAS\n`;
  markdown += `2. **Optimize Underperformers**: Review and improve low-converting keywords\n`;
  markdown += `3. **A/B Testing**: Test new ad copy and landing page variations\n`;
  markdown += `4. **Seasonal Adjustments**: Prepare campaigns for upcoming seasonal trends\n\n`;

  markdown += `---\n\n`;
  markdown += `*Report generated automatically by Royal Carriage ROI Analytics*\n`;
  markdown += `*Data source: Firestore (bookings, ads_imports, gsc_pages)*\n`;

  return markdown;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🚀 Generating Weekly ROI Report...\n");

  try {
    // Get date ranges
    const weekRanges = getWeekRanges();
    console.log(
      `📅 Current week: ${weekRanges.current.start.toLocaleDateString()} - ${weekRanges.current.end.toLocaleDateString()}`,
    );
    console.log(
      `📅 Previous week: ${weekRanges.previous.start.toLocaleDateString()} - ${weekRanges.previous.end.toLocaleDateString()}\n`,
    );

    // Fetch data
    console.log("📊 Fetching booking data...");
    const currentBookings = await fetchBookingData(
      weekRanges.current.start,
      weekRanges.current.end,
    );
    const previousBookings = await fetchBookingData(
      weekRanges.previous.start,
      weekRanges.previous.end,
    );

    console.log("💰 Fetching ads data...");
    const currentAds = await fetchAdsData(
      weekRanges.current.start,
      weekRanges.current.end,
    );
    const previousAds = await fetchAdsData(
      weekRanges.previous.start,
      weekRanges.previous.end,
    );

    console.log("🔍 Fetching top pages...");
    const topPages = await fetchTopPages();

    // Combine data
    const currentData = {
      revenue: currentBookings?.totalRevenue || 0,
      spend: currentAds?.totalSpend || 0,
      conversions: currentAds?.conversions || 0,
      clicks: currentAds?.clicks || 0,
    };

    const previousData = {
      revenue: previousBookings?.totalRevenue || 0,
      spend: previousAds?.totalSpend || 0,
      conversions: previousAds?.conversions || 0,
      clicks: previousAds?.clicks || 0,
    };

    // Identify issues
    console.log("⚠️  Analyzing for issues...");
    const issues = await identifyIssues(currentData, previousData);

    // Generate report
    console.log("📝 Generating report...\n");
    const report = generateReport({
      current: currentData,
      previous: previousData,
      weekRanges,
      topPages,
      issues,
    });

    // Save report
    const reportsDir = path.join(ROOT, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportDate = new Date().toISOString().split("T")[0];
    const reportPath = path.join(reportsDir, `weekly-roi-${reportDate}.md`);
    fs.writeFileSync(reportPath, report);

    console.log(`✅ Report generated: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(
      `   Revenue: ${formatCurrency(currentData.revenue)} (${calculateChange(currentData.revenue, previousData.revenue).percentage.toFixed(1)}%)`,
    );
    console.log(`   Spend: ${formatCurrency(currentData.spend)}`);
    console.log(
      `   Profit: ${formatCurrency(currentData.revenue - currentData.spend)}`,
    );
    console.log(`   Issues: ${issues.length}\n`);
  } catch (error) {
    console.error("❌ Error generating report:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as generateWeeklyReport };
