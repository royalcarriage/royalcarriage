import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard, StatsGrid } from "@/components/admin/StatsCard";
import { Globe, Activity, TrendingUp, Users, Settings } from "lucide-react";

export default function PartyBusSitePage() {
  return (
    <>
      <SEO
        title="Party Bus Site | Royal Carriage Admin"
        description="Party bus rental site configuration"
        noindex={true}
      />
      <AdminLayout
        title="Party Bus Site"
        subtitle="Chicago party bus rental service"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Sites", href: "/admin/sites" },
          { label: "Party Bus" },
        ]}
        actions={
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        }
      >
        {/* Site Status */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Site Status"
            value="Live"
            icon={<Globe className="h-4 w-4" />}
            description="All systems operational"
          />
          <StatsCard
            title="Monthly Visitors"
            value="8,320"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 12.5, label: "vs last month" }}
          />
          <StatsCard
            title="Conversion Rate"
            value="4.1%"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: 0.8, label: "vs last month" }}
          />
          <StatsCard
            title="Avg. Response Time"
            value="156ms"
            icon={<Activity className="h-4 w-4" />}
            description="Past 24 hours"
          />
        </StatsGrid>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Site Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>Current site settings and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Domain</span>
                <span className="text-sm font-medium">partybus.royalcarriagelimo.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL Certificate</span>
                <Badge variant="default" className="bg-green-500/10 text-green-500">
                  Valid
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CDN Status</span>
                <Badge variant="default" className="bg-green-500/10 text-green-500">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Deployed</span>
                <span className="text-sm text-muted-foreground">5 days ago</span>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Status */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking & Analytics</CardTitle>
              <CardDescription>Monitoring and tracking configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Google Analytics</span>
                <Badge variant="default" className="bg-green-500/10 text-green-500">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Google Tag Manager</span>
                <Badge variant="default" className="bg-green-500/10 text-green-500">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conversion Tracking</span>
                <Badge variant="default" className="bg-green-500/10 text-green-500">
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Heatmaps</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
