import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  MousePointer,
  Activity,
  Globe,
} from "lucide-react";

export default function Analytics() {
  const stats = [
    {
      name: "Total Visitors",
      value: "12,458",
      change: "+12.5%",
      icon: Users,
      trend: "up",
    },
    {
      name: "Page Views",
      value: "45,231",
      change: "+8.3%",
      icon: Eye,
      trend: "up",
    },
    {
      name: "Avg. Session",
      value: "3m 24s",
      change: "+2.1%",
      icon: Clock,
      trend: "up",
    },
    {
      name: "Bounce Rate",
      value: "42.3%",
      change: "-5.2%",
      icon: MousePointer,
      trend: "down",
    },
  ];

  const topPages = [
    { page: "O'Hare Airport Limo", views: 8234, change: "+15%" },
    { page: "Midway Airport Limo", views: 6821, change: "+12%" },
    { page: "Home", views: 5432, change: "+8%" },
    { page: "Fleet", views: 3214, change: "+5%" },
    { page: "Pricing", views: 2876, change: "+3%" },
  ];

  const trafficSources = [
    { source: "Organic Search", percentage: 45, visitors: 5606 },
    { source: "Direct", percentage: 28, visitors: 3488 },
    { source: "Social Media", percentage: 15, visitors: 1869 },
    { source: "Referral", percentage: 12, visitors: 1495 },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Website traffic and user behavior insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      stat.trend === "up"
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Pages
              </CardTitle>
              <CardDescription>Most visited pages this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{page.page}</p>
                        <p className="text-sm text-gray-500">
                          {page.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-green-700 bg-green-50"
                    >
                      {page.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Traffic Sources
              </CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {source.source}
                      </span>
                      <span className="text-sm text-gray-600">
                        {source.visitors.toLocaleString()} visitors
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {source.percentage}% of total traffic
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-600" />
              Google Analytics Integration
            </CardTitle>
            <CardDescription>
              Connect your Google Analytics account for real-time data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                The data shown above is sample data. Connect your Google
                Analytics account to see real visitor data and insights.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Connect Google Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
