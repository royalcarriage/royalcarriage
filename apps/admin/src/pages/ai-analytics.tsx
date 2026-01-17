import { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  DollarSign,
  FileText,
  Image,
  Languages,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

// Types
interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

// Generate mock data
const generateDailyData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      contentGenerated: Math.floor(Math.random() * 50) + 20,
      seoAnalysis: Math.floor(Math.random() * 100) + 50,
      imageOptimized: Math.floor(Math.random() * 30) + 10,
      translations: Math.floor(Math.random() * 20) + 5,
      tokensUsed: Math.floor(Math.random() * 100000) + 50000,
      cost: Math.random() * 20 + 5,
      latency: Math.floor(Math.random() * 150) + 80,
      successRate: 95 + Math.random() * 5,
    });
  }
  return data;
};

const modelPerformance = [
  { model: "Gemini Pro", accuracy: 94, speed: 85, cost: 70, reliability: 92 },
  { model: "Gemini Flash", accuracy: 88, speed: 95, cost: 90, reliability: 90 },
  { model: "GPT-4o", accuracy: 96, speed: 75, cost: 50, reliability: 94 },
  { model: "Claude 3.5", accuracy: 95, speed: 80, cost: 60, reliability: 96 },
];

const contentTypeDistribution = [
  { name: "SEO Content", value: 35, color: "#8b5cf6" },
  { name: "Location Pages", value: 25, color: "#06b6d4" },
  { name: "Service Descriptions", value: 20, color: "#10b981" },
  { name: "Blog Posts", value: 12, color: "#f59e0b" },
  { name: "FAQs", value: 8, color: "#ec4899" },
];

const sentimentData = [
  { category: "Positive", count: 245, percentage: 72 },
  { category: "Neutral", count: 68, percentage: 20 },
  { category: "Negative", count: 27, percentage: 8 },
];

const qualityScoreDistribution = [
  { range: "90-100", count: 156, color: "#10b981" },
  { range: "80-89", count: 234, color: "#06b6d4" },
  { range: "70-79", count: 89, color: "#f59e0b" },
  { range: "60-69", count: 34, color: "#f97316" },
  { range: "<60", count: 12, color: "#ef4444" },
];

const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  requests: Math.floor(Math.random() * 200) + 50,
  errors: Math.floor(Math.random() * 10),
}));

// Metric Card Component
function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  color = "amber",
}: {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
  color?: string;
}) {
  const colorClasses = {
    amber: "bg-amber-500/10 text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
    purple: "bg-purple-500/10 text-purple-400",
    red: "bg-red-500/10 text-red-400",
  };

  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
        ? "text-red-400"
        : "text-slate-400";
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{change}</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-xs text-slate-500 mt-1">{changeLabel}</div>
    </div>
  );
}

// Chart Card Component
function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Icon className="w-5 h-5 text-amber-400" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// Main Component
export function AIAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: "Last 7 days",
  });
  const [dailyData] = useState(generateDailyData(7));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Calculate totals
  const totals = dailyData.reduce(
    (acc, day) => ({
      content: acc.content + day.contentGenerated,
      seo: acc.seo + day.seoAnalysis,
      images: acc.images + day.imageOptimized,
      translations: acc.translations + day.translations,
      tokens: acc.tokens + day.tokensUsed,
      cost: acc.cost + day.cost,
    }),
    { content: 0, seo: 0, images: 0, translations: 0, tokens: 0, cost: 0 },
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            AI Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Comprehensive AI system performance and usage metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange.label}
            onChange={(e) => {
              const days =
                e.target.value === "Last 7 days"
                  ? 7
                  : e.target.value === "Last 30 days"
                    ? 30
                    : 90;
              setDateRange({
                start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                end: new Date(),
                label: e.target.value,
              });
            }}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 rounded-xl text-white text-sm hover:bg-amber-500 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Content Generated"
          value={totals.content.toLocaleString()}
          change="+23.5%"
          changeLabel="vs previous period"
          icon={FileText}
          trend="up"
          color="purple"
        />
        <MetricCard
          title="SEO Analyses"
          value={totals.seo.toLocaleString()}
          change="+18.2%"
          changeLabel="vs previous period"
          icon={BarChart3}
          trend="up"
          color="cyan"
        />
        <MetricCard
          title="Tokens Used"
          value={`${(totals.tokens / 1000000).toFixed(2)}M`}
          change="+12.8%"
          changeLabel="vs previous period"
          icon={Zap}
          trend="up"
          color="amber"
        />
        <MetricCard
          title="Total Cost"
          value={`$${totals.cost.toFixed(2)}`}
          change="-5.3%"
          changeLabel="efficiency improved"
          icon={DollarSign}
          trend="down"
          color="emerald"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Images Optimized"
          value={totals.images.toLocaleString()}
          change="+8.4%"
          changeLabel="vs previous period"
          icon={Image}
          trend="up"
          color="cyan"
        />
        <MetricCard
          title="Translations"
          value={totals.translations.toLocaleString()}
          change="+15.1%"
          changeLabel="vs previous period"
          icon={Languages}
          trend="up"
          color="purple"
        />
        <MetricCard
          title="Avg Quality Score"
          value="86.4"
          change="+2.1"
          changeLabel="points improvement"
          icon={CheckCircle}
          trend="up"
          color="emerald"
        />
        <MetricCard
          title="Error Rate"
          value="0.8%"
          change="-0.3%"
          changeLabel="improved reliability"
          icon={AlertCircle}
          trend="down"
          color="red"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Generation Trend */}
        <ChartCard
          title="Content Generation Trend"
          subtitle="Daily AI content output"
          icon={TrendingUp}
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={dailyData}>
              <defs>
                <linearGradient
                  id="contentGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#f8fafc" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="contentGenerated"
                name="Content"
                stroke="#8b5cf6"
                fill="url(#contentGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="seoAnalysis"
                name="SEO Analyses"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Token Usage & Cost */}
        <ChartCard
          title="Token Usage & Cost"
          subtitle="Resource consumption analysis"
          icon={DollarSign}
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#f8fafc" }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="tokensUsed"
                name="Tokens (K)"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                name="Cost ($)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Type Distribution */}
        <ChartCard title="Content Type Distribution" icon={PieChartIcon}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={contentTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {contentTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {contentTypeDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-300 truncate">
                  {item.name}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Model Performance Radar */}
        <ChartCard title="Model Performance Comparison" icon={Brain}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={modelPerformance}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="model"
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 10 }}
              />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
              <Radar
                name="Speed"
                dataKey="speed"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.3}
              />
              <Radar
                name="Cost Efficiency"
                dataKey="cost"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quality Score Distribution */}
        <ChartCard title="Quality Score Distribution" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityScoreDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="range"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {qualityScoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between text-sm mt-4 px-2">
            <span className="text-slate-400">Total Content Pieces</span>
            <span className="text-white font-semibold">
              {qualityScoreDistribution.reduce(
                (acc, item) => acc + item.count,
                0,
              )}
            </span>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <ChartCard title="Sentiment Analysis Results" icon={ThumbsUp}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {sentimentData.map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className={`text-3xl font-bold ${
                    item.category === "Positive"
                      ? "text-emerald-400"
                      : item.category === "Negative"
                        ? "text-red-400"
                        : "text-slate-400"
                  }`}
                >
                  {item.percentage}%
                </div>
                <div className="text-sm text-slate-400">{item.category}</div>
                <div className="text-xs text-slate-500">
                  {item.count} reviews
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {sentimentData.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{item.category}</span>
                  <span className="text-slate-400">{item.count}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.category === "Positive"
                        ? "bg-emerald-500"
                        : item.category === "Negative"
                          ? "bg-red-500"
                          : "bg-slate-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Hourly Activity */}
        <ChartCard title="24-Hour Activity Pattern" icon={Clock}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyActivity}>
              <defs>
                <linearGradient
                  id="activityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="hour"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 10 }}
                interval={2}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#f8fafc" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#06b6d4"
                fill="url(#activityGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="errors"
                name="Errors"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Performance Metrics Table */}
      <ChartCard title="Latency & Performance Metrics" icon={Zap}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                  Date
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  Avg Latency
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  Success Rate
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  Requests
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  Tokens
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((day, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30"
                >
                  <td className="py-3 px-4 text-sm text-white">{day.date}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span
                      className={
                        day.latency < 100
                          ? "text-emerald-400"
                          : day.latency < 150
                            ? "text-amber-400"
                            : "text-red-400"
                      }
                    >
                      {day.latency}ms
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span
                      className={
                        day.successRate > 98
                          ? "text-emerald-400"
                          : day.successRate > 95
                            ? "text-amber-400"
                            : "text-red-400"
                      }
                    >
                      {day.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-300">
                    {(day.contentGenerated + day.seoAnalysis).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-300">
                    {(day.tokensUsed / 1000).toFixed(1)}K
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-300">
                    ${day.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

export default AIAnalytics;
