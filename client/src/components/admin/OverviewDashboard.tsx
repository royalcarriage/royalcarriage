import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Play,
  FileText,
  BarChart3,
  AlertTriangle
} from "lucide-react";

interface OverviewDashboardProps {
  selectedSite: string;
}

export function OverviewDashboard({ selectedSite }: OverviewDashboardProps) {
  // Mock data - will be replaced with real API calls
  const statusColors = {
    live: "bg-green-500",
    pending: "bg-yellow-500",
    building: "bg-blue-500",
  };

  const siteStatus = {
    airport: { live: true, lastDeploy: "2 hours ago", health: "good" },
    partybus: { live: false, lastDeploy: "Never", health: "pending" },
    executive: { live: false, lastDeploy: "Never", health: "pending" },
    wedding: { live: false, lastDeploy: "Never", health: "pending" },
  };

  const metrics = {
    seoScore: 78,
    pagesAnalyzed: 12,
    highIssues: 3,
    medIssues: 5,
    revenue30d: 45320,
    adSpend30d: 8450,
    roas: 5.4,
    profitProxy: 36870,
  };

  const recentActivity = [
    { time: "2 hours ago", icon: BarChart3, text: "Daily page analysis completed (12 pages, avg score: 78)", type: "success" },
    { time: "1 day ago", icon: DollarSign, text: "ROI report generated ($45K revenue, ROAS 5.4)", type: "success" },
    { time: "2 days ago", icon: AlertTriangle, text: "3 high-priority SEO issues detected", type: "warning" },
    { time: "3 days ago", icon: CheckCircle, text: "Phase 1 improvements deployed (GA4, trust signals)", type: "success" },
  ];

  const automationSchedule = [
    { name: "Daily Page Analysis", schedule: "2:00 AM CT", status: "active" },
    { name: "Weekly SEO Report", schedule: "Mon 9:00 AM CT", status: "active" },
    { name: "Biweekly Content Proposals", schedule: "Mon 10:00 AM CT", status: "active" },
    { name: "Monthly Full Site Audit", schedule: "1st of month", status: "active" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Site Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Site Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={siteStatus[selectedSite as keyof typeof siteStatus]?.live ? statusColors.live : statusColors.pending}>
                {siteStatus[selectedSite as keyof typeof siteStatus]?.live ? "Live" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Deploy</span>
              <span className="text-sm font-medium">{siteStatus[selectedSite as keyof typeof siteStatus]?.lastDeploy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Health</span>
              <Badge variant="outline" className="capitalize">
                {siteStatus[selectedSite as keyof typeof siteStatus]?.health}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* SEO Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              SEO Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg SEO Score</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">{metrics.seoScore}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pages Analyzed</span>
              <span className="text-sm font-medium">{metrics.pagesAnalyzed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Issues</span>
              <div className="flex gap-2">
                <Badge variant="destructive" className="text-xs">{metrics.highIssues} High</Badge>
                <Badge variant="outline" className="text-xs">{metrics.medIssues} Med</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Impact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue Impact (30d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="text-sm font-bold text-green-600">${(metrics.revenue30d / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ad Spend</span>
              <span className="text-sm font-medium">${(metrics.adSpend30d / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ROAS</span>
              <Badge className="bg-green-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {metrics.roas.toFixed(1)}x
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <BarChart3 className="h-4 w-4" />
              Run Page Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <DollarSign className="h-4 w-4" />
              Import Metrics (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Generate SEO Report
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <AlertCircle className="h-4 w-4" />
              View High-Priority Issues
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest AI operations and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                const iconColor = activity.type === "success" ? "text-green-600" : 
                                 activity.type === "warning" ? "text-yellow-600" : "text-blue-600";
                return (
                  <div key={index} className="flex gap-3">
                    <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-purple-500" />
            Automation Schedule
          </CardTitle>
          <CardDescription>Scheduled AI tasks and jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {automationSchedule.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-sm">{job.name}</div>
                  <div className="text-xs text-gray-500 mt-1">Runs {job.schedule}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {job.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
