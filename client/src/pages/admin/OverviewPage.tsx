import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard, StatsGrid } from "@/components/admin/StatsCard";
import {
  FileUp,
  Play,
  Rocket,
  TrendingUp,
  DollarSign,
  Database,
  BarChart,
} from "lucide-react";

export default function OverviewPage() {
  return (
    <>
      <SEO
        title="Overview | Royal Carriage Admin"
        description="Admin overview dashboard"
        noindex={true}
      />
      <AdminLayout
        title="Overview"
        subtitle="Quick overview of key metrics and actions"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Overview" },
        ]}
      >
        {/* KPI Cards */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Data Freshness"
            value="2h ago"
            icon={<Database className="h-4 w-4" />}
            description="Last sync"
          />
          <StatsCard
            title="Total Spend"
            value="$12,450"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 5.2, label: "vs last month" }}
          />
          <StatsCard
            title="Revenue"
            value="$45,230"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: 12.3, label: "vs last month" }}
          />
          <StatsCard
            title="Profit Proxy"
            value="$32,780"
            icon={<BarChart className="h-4 w-4" />}
            trend={{ value: 15.8, label: "vs last month" }}
          />
        </StatsGrid>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <FileUp className="h-6 w-6" />
                <span>Import Data</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Play className="h-6 w-6" />
                <span>Run Gate</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Rocket className="h-6 w-6" />
                <span>Deploy</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
