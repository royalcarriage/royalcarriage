import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Activity,
  Database,
  FileText,
  Image,
  BarChart3,
  Search,
} from "lucide-react";

interface DataSourceStatus {
  name: string;
  status: 'fresh' | 'stale' | 'critical' | 'missing';
  lastUpdated: string | null;
  age: number;
  threshold: number;
}

interface SystemMetrics {
  pagesPublished: number;
  pagesBlocked: number;
  errorCount: number;
  lastRunTimestamp: string;
}

export default function SystemStatus() {
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([
    {
      name: 'Moovs CSV',
      status: 'fresh',
      lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      age: 12,
      threshold: 24
    },
    {
      name: 'Google Ads CSV',
      status: 'stale',
      lastUpdated: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      age: 36,
      threshold: 168
    },
    {
      name: 'GA4 Data',
      status: 'fresh',
      lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      age: 6,
      threshold: 24
    },
    {
      name: 'GSC Data',
      status: 'critical',
      lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      age: 336,
      threshold: 168
    },
    {
      name: 'SEO Bot Queue',
      status: 'fresh',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      age: 2,
      threshold: 24
    }
  ]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    pagesPublished: 23,
    pagesBlocked: 5,
    errorCount: 3,
    lastRunTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'stale':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'missing':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fresh':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Fresh</Badge>;
      case 'stale':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Stale</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      case 'missing':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Missing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Implement actual API call to check data freshness
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const freshCount = dataSources.filter(ds => ds.status === 'fresh').length;
  const staleCount = dataSources.filter(ds => ds.status === 'stale').length;
  const criticalCount = dataSources.filter(ds => ds.status === 'critical').length;
  const missingCount = dataSources.filter(ds => ds.status === 'missing').length;

  return (
    <AdminLayout>
      <SEO
        title="System Status | Admin Dashboard"
        description="Monitor AI-powered website management system health"
        noindex={true}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
            <p className="text-muted-foreground">
              Monitor data freshness and system health
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Alert Banner */}
        {criticalCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Critical Issues Detected</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {criticalCount} data source{criticalCount > 1 ? 's are' : ' is'} critically stale. Please update immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Fresh Data
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freshCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Updated recently
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Stale Data
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staleCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Needs update soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Critical Issues
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pages Published
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pagesPublished}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month / {metrics.pagesBlocked} blocked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources Status */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Real-time status of all data sources feeding the AI system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Threshold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((source) => (
                  <TableRow key={source.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(source.status)}
                        {source.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(source.status)}
                    </TableCell>
                    <TableCell>
                      {formatTimestamp(source.lastUpdated)}
                    </TableCell>
                    <TableCell>
                      {source.age}h
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {source.threshold}h
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last system operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">SEO Gate Check</p>
                    <p className="text-xs text-muted-foreground">
                      Passed 5 drafts, blocked 2
                    </p>
                    <p className="text-xs text-muted-foreground">30 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data Import</p>
                    <p className="text-xs text-muted-foreground">
                      Imported 150 Moovs records
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Site Crawler</p>
                    <p className="text-xs text-muted-foreground">
                      Scanned 87 pages, 3 issues found
                    </p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Errors</CardTitle>
              <CardDescription>Recent errors and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.errorCount === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <p className="text-sm font-medium">No errors</p>
                  <p className="text-xs">System running smoothly</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">GSC Sync Failed</p>
                      <p className="text-xs text-muted-foreground">
                        API authentication error
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lighthouse Warning</p>
                      <p className="text-xs text-muted-foreground">
                        Performance below 70 on 2 pages
                      </p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
