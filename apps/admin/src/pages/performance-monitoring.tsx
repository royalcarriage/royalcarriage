import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "../state/AuthProvider";

// ============ INTERFACES ============

interface PerformanceMetric {
  contentId: string;
  websiteId: string;
  locationId: string;
  serviceId: string;
  url: string;
  title: string;
  search: {
    impressions: number;
    clicks: number;
    avgPosition: number;
    ctr: number;
  };
  engagement: {
    pageViews: number;
    sessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  seoScore: number;
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

interface SummaryStats {
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  avgPosition: number;
  totalPageViews: number;
  avgBounceRate: number;
  avgSessionDuration: number;
  totalPages: number;
}

interface RankingDistribution {
  top10: number;
  top20: number;
  top50: number;
  beyond50: number;
}

interface ContentAgeAnalysis {
  fresh: number;
  aging: number;
  stale: number;
}

interface TrafficDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  pageViews: number;
}

// ============ MAIN COMPONENT ============

export default function PerformanceMonitoringPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [activeTab, setActiveTab] = useState<
    "overview" | "traffic" | "keywords" | "content"
  >("overview");

  // Data states
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [topPerformers, setTopPerformers] = useState<PerformanceMetric[]>([]);
  const [needsImprovement, setNeedsImprovement] = useState<PerformanceMetric[]>(
    [],
  );
  const [rankingDistribution, setRankingDistribution] =
    useState<RankingDistribution | null>(null);
  const [contentAgeAnalysis, setContentAgeAnalysis] =
    useState<ContentAgeAnalysis | null>(null);
  const [keywordRankings, setKeywordRankings] = useState<KeywordRanking[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    if (role !== "admin" && role !== "superadmin" && role !== "viewer") {
      return;
    }
    loadPerformanceData();
  }, [role, selectedWebsite, dateRange]);

  async function loadPerformanceData() {
    try {
      setLoading(true);

      // Load performance metrics
      let metricsQuery;
      if (selectedWebsite === "all") {
        metricsQuery = query(collection(db, "performance_metrics"));
      } else {
        metricsQuery = query(
          collection(db, "performance_metrics"),
          where("websiteId", "==", selectedWebsite),
        );
      }

      const metricsSnapshot = await getDocs(metricsQuery);
      const metrics = metricsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          contentId: doc.id,
          websiteId: data.websiteId || "",
          locationId: data.locationId || "",
          serviceId: data.serviceId || "",
          url: data.url || "",
          title: data.title || "",
          search: data.search || {
            impressions: 0,
            clicks: 0,
            avgPosition: 0,
            ctr: 0,
          },
          engagement: data.engagement || {
            pageViews: 0,
            sessions: 0,
            avgSessionDuration: 0,
            bounceRate: 0,
            conversionRate: 0,
          },
          seoScore: data.seoScore || 0,
          ...data,
        } as PerformanceMetric;
      });

      // Calculate summary stats
      if (metrics.length > 0) {
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

        setSummary({
          totalImpressions,
          totalClicks,
          avgCtr:
            totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
          avgPosition:
            metrics.reduce((sum, m) => sum + (m.search?.avgPosition || 0), 0) /
            metrics.length,
          totalPageViews,
          avgBounceRate:
            metrics.reduce(
              (sum, m) => sum + (m.engagement?.bounceRate || 0),
              0,
            ) / metrics.length,
          avgSessionDuration:
            metrics.reduce(
              (sum, m) => sum + (m.engagement?.avgSessionDuration || 0),
              0,
            ) / metrics.length,
          totalPages: metrics.length,
        });

        // Top performers
        const sorted = [...metrics].sort(
          (a, b) => (b.search?.clicks || 0) - (a.search?.clicks || 0),
        );
        setTopPerformers(sorted.slice(0, 10));

        // Needs improvement
        const needsWork = [...metrics]
          .filter(
            (m) =>
              ((m.search?.impressions || 0) > 100 &&
                (m.search?.ctr || 0) < 1) ||
              (m.engagement?.bounceRate || 0) > 70,
          )
          .sort(
            (a, b) =>
              (b.search?.impressions || 0) - (a.search?.impressions || 0),
          );
        setNeedsImprovement(needsWork.slice(0, 10));

        // Ranking distribution
        setRankingDistribution({
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
        });
      } else {
        setSummary({
          totalImpressions: 0,
          totalClicks: 0,
          avgCtr: 0,
          avgPosition: 0,
          totalPageViews: 0,
          avgBounceRate: 0,
          avgSessionDuration: 0,
          totalPages: 0,
        });
        setTopPerformers([]);
        setNeedsImprovement([]);
        setRankingDistribution({ top10: 0, top20: 0, top50: 0, beyond50: 0 });
      }

      // Load keyword rankings
      let keywordsQuery;
      if (selectedWebsite === "all") {
        keywordsQuery = query(collection(db, "keyword_rankings"));
      } else {
        keywordsQuery = query(
          collection(db, "keyword_rankings"),
          where("websiteId", "==", selectedWebsite),
        );
      }

      const keywordsSnapshot = await getDocs(keywordsQuery);
      const keywords = keywordsSnapshot.docs
        .map((doc) => doc.data() as KeywordRanking)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 50);
      setKeywordRankings(keywords);

      // Load content age analysis
      const ageSnapshot = await getDocs(collection(db, "content_age_tracking"));
      const ageData = ageSnapshot.docs.map((doc) => doc.data());
      setContentAgeAnalysis({
        fresh: ageData.filter((c) => (c.ageInDays || 0) <= 30).length,
        aging: ageData.filter(
          (c) => (c.ageInDays || 0) > 30 && (c.ageInDays || 0) <= 90,
        ).length,
        stale: ageData.filter((c) => (c.ageInDays || 0) > 90).length,
      });

      // Load traffic trends
      const trendsSnapshot = await getDocs(
        collection(db, "performance_trends"),
      );
      const trendData = trendsSnapshot.docs.map((doc) => doc.data());
      setTrends(trendData);

      // Generate sample traffic data for chart
      generateTrafficChartData();
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  }

  function generateTrafficChartData() {
    // Generate sample data for the time series chart
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const data: TrafficDataPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        impressions: Math.floor(Math.random() * 1000) + 500,
        clicks: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 200) + 50,
      });
    }

    setTrafficData(data);
  }

  function getPositionColor(position: number): string {
    if (position <= 3) return "text-green-600";
    if (position <= 10) return "text-blue-600";
    if (position <= 20) return "text-yellow-600";
    return "text-red-600";
  }

  function getChangeIcon(change: number): string {
    if (change > 0) return "up";
    if (change < 0) return "down";
    return "stable";
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  if (role !== "admin" && role !== "superadmin" && role !== "viewer") {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Performance Monitoring
          </h1>
          <p className="text-gray-600">
            Track SEO performance, keyword rankings, and content engagement
            metrics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="all">All Websites</option>
            <option value="airport">Airport</option>
            <option value="corporate">Corporate</option>
            <option value="wedding">Wedding</option>
            <option value="partyBus">Party Bus</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(e.target.value as "7d" | "30d" | "90d")
            }
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button
            onClick={loadPerformanceData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "traffic", label: "Traffic Analytics" },
              { id: "keywords", label: "Keyword Rankings" },
              { id: "content", label: "Content Performance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading performance data...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && summary && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      Impressions
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {formatNumber(summary.totalImpressions)}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Search visibility
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      Clicks
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {formatNumber(summary.totalClicks)}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      From search results
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      Avg CTR
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {summary.avgCtr.toFixed(2)}%
                    </div>
                    <div
                      className={`text-sm mt-1 ${summary.avgCtr >= 2 ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {summary.avgCtr >= 2 ? "Good" : "Needs improvement"}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      Avg Position
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {summary.avgPosition.toFixed(1)}
                    </div>
                    <div
                      className={`text-sm mt-1 ${summary.avgPosition <= 20 ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {summary.avgPosition <= 10
                        ? "Top 10"
                        : summary.avgPosition <= 20
                          ? "Top 20"
                          : "Needs work"}
                    </div>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
                    <div className="text-sm text-purple-700 uppercase tracking-wide">
                      Page Views
                    </div>
                    <div className="text-3xl font-bold text-purple-900 mt-1">
                      {formatNumber(summary.totalPageViews)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
                    <div className="text-sm text-orange-700 uppercase tracking-wide">
                      Avg Bounce Rate
                    </div>
                    <div className="text-3xl font-bold text-orange-900 mt-1">
                      {summary.avgBounceRate.toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-6">
                    <div className="text-sm text-teal-700 uppercase tracking-wide">
                      Avg Session
                    </div>
                    <div className="text-3xl font-bold text-teal-900 mt-1">
                      {Math.floor(summary.avgSessionDuration / 60)}:
                      {String(
                        Math.floor(summary.avgSessionDuration % 60),
                      ).padStart(2, "0")}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-6">
                    <div className="text-sm text-indigo-700 uppercase tracking-wide">
                      Total Pages
                    </div>
                    <div className="text-3xl font-bold text-indigo-900 mt-1">
                      {summary.totalPages}
                    </div>
                  </div>
                </div>

                {/* Ranking Distribution */}
                {rankingDistribution && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Ranking Distribution
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {rankingDistribution.top10}
                        </div>
                        <div className="text-sm text-gray-600">
                          Position 1-10
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${summary.totalPages > 0 ? (rankingDistribution.top10 / summary.totalPages) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {rankingDistribution.top20}
                        </div>
                        <div className="text-sm text-gray-600">
                          Position 11-20
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${summary.totalPages > 0 ? (rankingDistribution.top20 / summary.totalPages) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {rankingDistribution.top50}
                        </div>
                        <div className="text-sm text-gray-600">
                          Position 21-50
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{
                              width: `${summary.totalPages > 0 ? (rankingDistribution.top50 / summary.totalPages) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {rankingDistribution.beyond50}
                        </div>
                        <div className="text-sm text-gray-600">
                          Position 50+
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${summary.totalPages > 0 ? (rankingDistribution.beyond50 / summary.totalPages) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Age Analysis */}
                {contentAgeAnalysis && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Content Freshness
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {contentAgeAnalysis.fresh}
                        </div>
                        <div className="text-sm text-gray-600">
                          Fresh (0-30 days)
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {contentAgeAnalysis.aging}
                        </div>
                        <div className="text-sm text-gray-600">
                          Aging (30-90 days)
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {contentAgeAnalysis.stale}
                        </div>
                        <div className="text-sm text-gray-600">
                          Stale (90+ days)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Traffic Analytics Tab */}
            {activeTab === "traffic" && (
              <>
                {/* Traffic Chart */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Traffic Over Time
                  </h3>
                  <div className="h-64 flex items-end gap-1">
                    {trafficData.slice(-30).map((point, index) => {
                      const maxImpressions = Math.max(
                        ...trafficData.map((d) => d.impressions),
                      );
                      const height =
                        maxImpressions > 0
                          ? (point.impressions / maxImpressions) * 100
                          : 0;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition relative group"
                          style={{ height: `${height}%`, minHeight: "4px" }}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                            {point.date}: {point.impressions} impressions
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{trafficData[0]?.date}</span>
                    <span>{trafficData[trafficData.length - 1]?.date}</span>
                  </div>
                </div>

                {/* Traffic Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      IMPRESSIONS TREND
                    </h4>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatNumber(
                        trafficData.reduce((sum, d) => sum + d.impressions, 0),
                      )}
                    </div>
                    <div className="text-sm text-green-600 mt-2">
                      Total in period
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      CLICKS TREND
                    </h4>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatNumber(
                        trafficData.reduce((sum, d) => sum + d.clicks, 0),
                      )}
                    </div>
                    <div className="text-sm text-blue-600 mt-2">
                      Total in period
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      PAGE VIEWS TREND
                    </h4>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatNumber(
                        trafficData.reduce((sum, d) => sum + d.pageViews, 0),
                      )}
                    </div>
                    <div className="text-sm text-purple-600 mt-2">
                      Total in period
                    </div>
                  </div>
                </div>

                {/* Daily Breakdown Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">
                      Daily Breakdown
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Impressions
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Clicks
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            CTR
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Page Views
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {trafficData
                          .slice(-14)
                          .reverse()
                          .map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {row.date}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                {formatNumber(row.impressions)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                {formatNumber(row.clicks)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                {row.impressions > 0
                                  ? (
                                      (row.clicks / row.impressions) *
                                      100
                                    ).toFixed(2)
                                  : "0.00"}
                                %
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                {formatNumber(row.pageViews)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Keywords Tab */}
            {activeTab === "keywords" && (
              <>
                {/* Keyword Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-sm text-gray-500 uppercase">
                      Total Keywords
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {keywordRankings.length}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                    <div className="text-sm text-green-700 uppercase">
                      Top 10
                    </div>
                    <div className="text-3xl font-bold text-green-900 mt-1">
                      {keywordRankings.filter((k) => k.position <= 10).length}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                    <div className="text-sm text-blue-700 uppercase">
                      Moving Up
                    </div>
                    <div className="text-3xl font-bold text-blue-900 mt-1">
                      {keywordRankings.filter((k) => k.change > 0).length}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                    <div className="text-sm text-red-700 uppercase">
                      Declining
                    </div>
                    <div className="text-3xl font-bold text-red-900 mt-1">
                      {keywordRankings.filter((k) => k.change < 0).length}
                    </div>
                  </div>
                </div>

                {/* Keywords Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">
                      Keyword Rankings
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Keyword
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Position
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Change
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Impressions
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Clicks
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            CTR
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Volume
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {keywordRankings.map((keyword, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {keyword.keyword}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {keyword.url}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`text-lg font-bold ${getPositionColor(keyword.position)}`}
                              >
                                {keyword.position}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {keyword.change !== 0 && (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                                    keyword.change > 0
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {keyword.change > 0 ? "+" : ""}
                                  {keyword.change}
                                </span>
                              )}
                              {keyword.change === 0 && (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-900">
                              {formatNumber(keyword.impressions)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-900">
                              {formatNumber(keyword.clicks)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-900">
                              {keyword.ctr.toFixed(2)}%
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                              {formatNumber(keyword.searchVolume)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {keywordRankings.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No keyword rankings data available yet. Run a sync to
                      populate data.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Content Performance Tab */}
            {activeTab === "content" && (
              <>
                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Top Performers */}
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 border-b bg-green-50">
                      <h3 className="text-lg font-bold text-green-900">
                        Top Performing Content
                      </h3>
                      <p className="text-sm text-green-700">
                        Highest clicks and engagement
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {topPerformers.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {item.title || item.locationId}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {item.url}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              {item.search?.clicks || 0}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>
                              Impressions:{" "}
                              {formatNumber(item.search?.impressions || 0)}
                            </span>
                            <span>
                              CTR: {(item.search?.ctr || 0).toFixed(2)}%
                            </span>
                            <span>
                              Position:{" "}
                              {(item.search?.avgPosition || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {topPerformers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          No performance data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Needs Improvement */}
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 border-b bg-yellow-50">
                      <h3 className="text-lg font-bold text-yellow-900">
                        Needs Improvement
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Low CTR or high bounce rate
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {needsImprovement.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {item.title || item.locationId}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {item.url}
                              </p>
                            </div>
                            <span
                              className={`text-sm px-2 py-1 rounded ${
                                (item.search?.ctr || 0) < 1
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {(item.search?.ctr || 0) < 1
                                ? "Low CTR"
                                : "High Bounce"}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>
                              Impressions:{" "}
                              {formatNumber(item.search?.impressions || 0)}
                            </span>
                            <span>
                              CTR: {(item.search?.ctr || 0).toFixed(2)}%
                            </span>
                            <span>
                              Bounce:{" "}
                              {(item.engagement?.bounceRate || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {needsImprovement.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          All content performing well!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                  <h3 className="text-lg font-bold text-indigo-900 mb-4">
                    Performance Recommendations
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Improve CTR
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>- Optimize meta titles with action words</li>
                        <li>- Add compelling meta descriptions</li>
                        <li>- Include rich snippets and schema markup</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Reduce Bounce Rate
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>- Improve page load speed</li>
                        <li>- Add engaging above-fold content</li>
                        <li>- Include clear calls-to-action</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Boost Rankings
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>- Update stale content regularly</li>
                        <li>- Build quality backlinks</li>
                        <li>- Optimize for featured snippets</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Increase Engagement
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>- Add FAQ sections</li>
                        <li>- Include multimedia content</li>
                        <li>- Improve internal linking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
