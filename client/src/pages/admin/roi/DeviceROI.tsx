import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Smartphone, Monitor, TrendingUp, TrendingDown } from "lucide-react";

interface DeviceMetrics {
  device: "mobile" | "desktop";
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
  roas: number;
  bounceRate: number;
  avgTimeOnPage: number; // seconds
  sessions: number;
}

interface TrendData {
  date: string;
  mobileRevenue: number;
  desktopRevenue: number;
  mobileConversions: number;
  desktopConversions: number;
}

// Mock data for device comparison
const generateMockMetrics = (): DeviceMetrics[] => {
  return [
    {
      device: "mobile",
      spend: 8500,
      revenue: 32000,
      conversions: 45,
      cpa: 188.89,
      roas: 3.76,
      bounceRate: 62.5,
      avgTimeOnPage: 145,
      sessions: 3200,
    },
    {
      device: "desktop",
      spend: 12000,
      revenue: 58000,
      conversions: 78,
      cpa: 153.85,
      roas: 4.83,
      bounceRate: 48.2,
      avgTimeOnPage: 235,
      sessions: 2800,
    },
  ];
};

// Mock trend data for last 30 days
const generateMockTrends = (): TrendData[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      mobileRevenue: Math.floor(Math.random() * 2000) + 800,
      desktopRevenue: Math.floor(Math.random() * 3000) + 1500,
      mobileConversions: Math.floor(Math.random() * 3) + 1,
      desktopConversions: Math.floor(Math.random() * 4) + 2,
    };
  });
};

interface Recommendation {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

const generateRecommendations = (
  metrics: DeviceMetrics[],
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const mobile = metrics.find((m) => m.device === "mobile")!;
  const desktop = metrics.find((m) => m.device === "desktop")!;

  // ROAS comparison
  const roasDiff = Math.abs(desktop.roas - mobile.roas);
  if (roasDiff > 1) {
    recommendations.push({
      type: desktop.roas > mobile.roas ? "warning" : "success",
      title: `${desktop.roas > mobile.roas ? "Desktop" : "Mobile"} significantly outperforms`,
      description: `${desktop.roas > mobile.roas ? "Desktop" : "Mobile"} has ${roasDiff.toFixed(2)}x higher ROAS. Consider ${desktop.roas > mobile.roas ? "reducing mobile spend" : "increasing mobile spend"}.`,
      impact: "high",
    });
  }

  // Bounce rate issues
  if (mobile.bounceRate > 60) {
    recommendations.push({
      type: "warning",
      title: "High mobile bounce rate",
      description: `Mobile bounce rate is ${mobile.bounceRate.toFixed(1)}%. Optimize mobile UX, page speed, and CTA visibility.`,
      impact: "high",
    });
  }

  // Time on page
  if (desktop.avgTimeOnPage > mobile.avgTimeOnPage * 1.5) {
    recommendations.push({
      type: "info",
      title: "Mobile engagement lower than desktop",
      description: `Desktop users spend ${Math.round((desktop.avgTimeOnPage - mobile.avgTimeOnPage) / 60)} more minutes on page. Review mobile content layout.`,
      impact: "medium",
    });
  }

  // CPA comparison
  if (mobile.cpa > desktop.cpa) {
    recommendations.push({
      type: "warning",
      title: "Mobile CPA is higher",
      description: `Mobile CPA ($${mobile.cpa.toFixed(2)}) is ${(((mobile.cpa - desktop.cpa) / desktop.cpa) * 100).toFixed(0)}% higher than desktop. Review mobile landing pages and bid adjustments.`,
      impact: "high",
    });
  }

  // Sessions vs conversions
  if (
    mobile.sessions > desktop.sessions &&
    mobile.conversions < desktop.conversions
  ) {
    recommendations.push({
      type: "warning",
      title: "Mobile traffic not converting",
      description: `Mobile has ${mobile.sessions - desktop.sessions} more sessions but ${desktop.conversions - mobile.conversions} fewer conversions. Focus on mobile conversion optimization.`,
      impact: "high",
    });
  }

  return recommendations;
};

export function DeviceROI() {
  const [metrics] = useState<DeviceMetrics[]>(generateMockMetrics());
  const [trends] = useState<TrendData[]>(generateMockTrends());
  const recommendations = generateRecommendations(metrics);

  const mobile = metrics.find((m) => m.device === "mobile")!;
  const desktop = metrics.find((m) => m.device === "desktop")!;

  const comparisonData = [
    { metric: "Spend", mobile: mobile.spend, desktop: desktop.spend },
    { metric: "Revenue", mobile: mobile.revenue, desktop: desktop.revenue },
    {
      metric: "Conversions",
      mobile: mobile.conversions,
      desktop: desktop.conversions,
    },
  ];

  const engagementData = [
    {
      metric: "Bounce Rate",
      mobile: mobile.bounceRate,
      desktop: desktop.bounceRate,
    },
    {
      metric: "Avg Time (sec)",
      mobile: mobile.avgTimeOnPage,
      desktop: desktop.avgTimeOnPage,
    },
  ];

  const COLORS = {
    mobile: "#f59e0b",
    desktop: "#3b82f6",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Device ROI Comparison</CardTitle>
          <CardDescription>
            Mobile vs Desktop performance analysis with engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Mobile Card */}
            <Card className="border-2 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-orange-500" />
                    <h3 className="text-xl font-bold">Mobile</h3>
                  </div>
                  <Badge style={{ backgroundColor: COLORS.mobile }}>
                    {mobile.sessions.toLocaleString()} sessions
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spend</span>
                    <span className="font-semibold">
                      ${mobile.spend.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-semibold">
                      ${mobile.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversions</span>
                    <span className="font-semibold">{mobile.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROAS</span>
                    <span className="font-semibold">
                      {mobile.roas.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPA</span>
                    <span className="font-semibold">
                      ${mobile.cpa.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Bounce Rate</span>
                    <span className="font-semibold">
                      {mobile.bounceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Time on Page</span>
                    <span className="font-semibold">
                      {Math.floor(mobile.avgTimeOnPage / 60)}m{" "}
                      {mobile.avgTimeOnPage % 60}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Card */}
            <Card className="border-2 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold">Desktop</h3>
                  </div>
                  <Badge style={{ backgroundColor: COLORS.desktop }}>
                    {desktop.sessions.toLocaleString()} sessions
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spend</span>
                    <span className="font-semibold">
                      ${desktop.spend.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-semibold">
                      ${desktop.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversions</span>
                    <span className="font-semibold">{desktop.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROAS</span>
                    <span className="font-semibold">
                      {desktop.roas.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPA</span>
                    <span className="font-semibold">
                      ${desktop.cpa.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Bounce Rate</span>
                    <span className="font-semibold">
                      {desktop.bounceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Time on Page</span>
                    <span className="font-semibold">
                      {Math.floor(desktop.avgTimeOnPage / 60)}m{" "}
                      {desktop.avgTimeOnPage % 60}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Spend Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mobile" fill={COLORS.mobile} name="Mobile" />
                    <Bar
                      dataKey="desktop"
                      fill={COLORS.desktop}
                      name="Desktop"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mobile" fill={COLORS.mobile} name="Mobile" />
                    <Bar
                      dataKey="desktop"
                      fill={COLORS.desktop}
                      name="Desktop"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>30-Day Revenue Trend</CardTitle>
              <CardDescription>
                Daily revenue comparison by device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mobileRevenue"
                    stroke={COLORS.mobile}
                    name="Mobile Revenue"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="desktopRevenue"
                    stroke={COLORS.desktop}
                    name="Desktop Revenue"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Actionable insights based on performance gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.type === "warning"
                    ? "border-yellow-500 bg-yellow-50"
                    : rec.type === "success"
                      ? "border-green-500 bg-green-50"
                      : "border-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      {rec.type === "warning" ? (
                        <TrendingDown className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{rec.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      rec.impact === "high"
                        ? "border-red-500 text-red-700"
                        : rec.impact === "medium"
                          ? "border-yellow-500 text-yellow-700"
                          : "border-blue-500 text-blue-700"
                    }
                  >
                    {rec.impact} impact
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
