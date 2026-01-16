import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataFreshnessPanel } from "@/components/admin/DataFreshnessPanel";
import { RevenueProxyPanel } from "@/components/admin/RevenueProxyPanel";
import { ConversionHealthPanel } from "@/components/admin/ConversionHealthPanel";
import { SEOHealthPanel } from "@/components/admin/SEOHealthPanel";
import { PipelineStatusPanel } from "@/components/admin/PipelineStatusPanel";
import { PublishingFrozenBanner } from "@/components/admin/PublishingFrozenBanner";
import { shouldFreezePublishing } from "@/../../shared/kpi-thresholds";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Calendar } from "lucide-react";

export default function KPIDashboard() {
  // Mock data - in production, fetch from API
  const dataFreshnessData = {
    googleAds: 12, // hours ago
    ga4Events: 18,
    moovsCsv: 30,
    gscData: 5, // days ago (convert to hours: 5 * 24 = 120h)
  };

  const isFrozen = shouldFreezePublishing(dataFreshnessData);
  
  const staleDataSources = [];
  if (dataFreshnessData.googleAds > 72) staleDataSources.push('Google Ads (>72h)');
  if (dataFreshnessData.ga4Events > 72) staleDataSources.push('GA4 Events (>72h)');
  if (dataFreshnessData.moovsCsv > 72) staleDataSources.push('Moovs CSV (>72h)');
  if (dataFreshnessData.gscData > 14) staleDataSources.push('GSC Data (>14d)');

  // Mock dates for data freshness
  const now = Date.now();
  const googleAdsLastUpdate = new Date(now - dataFreshnessData.googleAds * 60 * 60 * 1000);
  const ga4EventsLastUpdate = new Date(now - dataFreshnessData.ga4Events * 60 * 60 * 1000);
  const moovsCsvLastUpdate = new Date(now - dataFreshnessData.moovsCsv * 60 * 60 * 1000);
  const gscDataLastUpdate = new Date(now - dataFreshnessData.gscData * 24 * 60 * 60 * 1000);

  const handleRefresh = () => {
    console.log('Refreshing KPI data...');
    // In production: trigger API call to refresh data
  };

  const handleExport = () => {
    console.log('Exporting KPI report...');
    // In production: generate and download report
  };

  return (
    <AdminLayout
      title="KPI Dashboard"
      subtitle="Production-grade SEO & revenue metrics with Green/Yellow/Red indicators"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "KPI Dashboard" },
      ]}
    >
      {/* Publishing Frozen Banner */}
      <PublishingFrozenBanner isVisible={isFrozen} staleDataSources={staleDataSources} />

      {/* Date Range Selector */}
      <div className="mb-6 flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">Last 7 days</Button>
          <Button variant="ghost" size="sm">Last 30 days</Button>
          <Button variant="ghost" size="sm">Custom Range</Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue & Profit</TabsTrigger>
          <TabsTrigger value="seo">SEO Health</TabsTrigger>
          <TabsTrigger value="pipeline">Content Pipeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <DataFreshnessPanel
              googleAdsLastUpdate={googleAdsLastUpdate}
              ga4EventsLastUpdate={ga4EventsLastUpdate}
              moovsCsvLastUpdate={moovsCsvLastUpdate}
              gscDataLastUpdate={gscDataLastUpdate}
            />
            <RevenueProxyPanel />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <SEOHealthPanel />
            <PipelineStatusPanel />
          </div>

          <ConversionHealthPanel />
        </TabsContent>

        {/* Revenue & Profit Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6">
            <RevenueProxyPanel />
          </div>
          <ConversionHealthPanel />
        </TabsContent>

        {/* SEO Health Tab */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <DataFreshnessPanel
              googleAdsLastUpdate={googleAdsLastUpdate}
              ga4EventsLastUpdate={ga4EventsLastUpdate}
              moovsCsvLastUpdate={moovsCsvLastUpdate}
              gscDataLastUpdate={gscDataLastUpdate}
            />
            <SEOHealthPanel />
          </div>
          <ConversionHealthPanel />
        </TabsContent>

        {/* Content Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <PipelineStatusPanel />
            <SEOHealthPanel />
          </div>
          
          {/* Pipeline Timeline Placeholder */}
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold mb-4">Publishing Timeline</h3>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Publishing schedule based on lifecycle:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Daily:</strong> Data imports, KPI computation (no publishing)</li>
                <li><strong>Weekly:</strong> Proposals, crawling, Lighthouse checks (no publishing)</li>
                <li><strong>Bi-weekly:</strong> Human review, quality gates, publish max 3-10 pages via PR</li>
                <li><strong>Monthly:</strong> Prune underperformers, merge cannibalized content</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Status Footer */}
      <div className="mt-8 p-4 rounded-lg border bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-1">
            <div className="font-medium">System Status</div>
            <div className="text-muted-foreground">
              All monitoring systems operational • Last check: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Data Sources</div>
              <div className="text-lg font-semibold">{isFrozen ? '🔴' : '🟢'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Quality Gates</div>
              <div className="text-lg font-semibold">🟢</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Publishing</div>
              <div className="text-lg font-semibold">{isFrozen ? '🔴' : '🟢'}</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
