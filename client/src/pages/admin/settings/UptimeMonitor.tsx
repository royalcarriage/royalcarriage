import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PrimaryButton } from '@/components/admin/buttons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Clock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SiteStatus {
  url: string;
  name: string;
  status: 'up' | 'down' | 'checking';
  responseTime: number;
  lastChecked: string;
  uptimePercentage: number;
  checksLast24h: number;
  failuresLast24h: number;
}

interface UptimeDataPoint {
  timestamp: string;
  responseTime: number;
  status: 'up' | 'down';
}

const MONITORED_URLS = [
  { url: 'https://royalcarriagelimoseo.web.app', name: 'Admin Dashboard' },
  { url: 'https://chicagoairportblackcar.com', name: 'Airport Site' },
  { url: 'https://chicagocorporatelimo.com', name: 'Corporate Site' },
  { url: 'https://chicagoweddinglimo.com', name: 'Wedding Site' },
  { url: 'https://chicagopartybus.com', name: 'Party Bus Site' }
];

export default function UptimeMonitor() {
  const [sites, setSites] = useState<SiteStatus[]>([]);
  const [checking, setChecking] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [responseTimeData, setResponseTimeData] = useState<UptimeDataPoint[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    checkAllSites();
    generateMockData();

    // Auto-refresh every 5 minutes
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkAllSites();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const generateMockData = () => {
    // Generate last 24 hours of data
    const now = new Date();
    const data: UptimeDataPoint[] = [];
    
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        responseTime: Math.random() * 200 + 100, // 100-300ms
        status: Math.random() > 0.05 ? 'up' : 'down' // 95% uptime
      });
    }
    
    setResponseTimeData(data);
  };

  const checkSite = async (url: string, name: string): Promise<SiteStatus> => {
    try {
      // TODO: Replace with actual health check endpoint
      // const startTime = Date.now();
      // const response = await fetch(`${url}/health`, { method: 'HEAD' });
      // const responseTime = Date.now() - startTime;
      
      // Mock data for skeleton implementation
      const responseTime = Math.random() * 300 + 50;
      const isUp = Math.random() > 0.1; // 90% chance of being up
      const uptimePercentage = 95 + Math.random() * 5; // 95-100%
      const checksLast24h = 288; // Every 5 minutes for 24 hours
      const failuresLast24h = Math.floor((100 - uptimePercentage) * checksLast24h / 100);
      
      return {
        url,
        name,
        status: isUp ? 'up' : 'down',
        responseTime: Math.round(responseTime),
        lastChecked: new Date().toISOString(),
        uptimePercentage,
        checksLast24h,
        failuresLast24h
      };
    } catch (error) {
      console.error(`Error checking ${url}:`, error);
      return {
        url,
        name,
        status: 'down',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        uptimePercentage: 0,
        checksLast24h: 288,
        failuresLast24h: 288
      };
    }
  };

  const checkAllSites = async () => {
    setChecking(true);
    
    try {
      const results = await Promise.all(
        MONITORED_URLS.map(({ url, name }) => checkSite(url, name))
      );
      
      setSites(results);
      
      // Check if any site is down and log alert
      const downSites = results.filter(s => s.status === 'down');
      if (downSites.length > 0) {
        console.warn('🚨 Sites down:', downSites.map(s => s.name).join(', '));
        // TODO: Send alert notification
      }
    } catch (error) {
      console.error('Error checking sites:', error);
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'down':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'down':
        return <XCircle className="h-4 w-4" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getUptimeColor = (percentage: number) => {
    if (percentage >= 99.5) return 'text-green-600';
    if (percentage >= 98) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallUptime = sites.length > 0
    ? sites.reduce((sum, site) => sum + site.uptimePercentage, 0) / sites.length
    : 0;

  const sitesDown = sites.filter(s => s.status === 'down').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Uptime Monitor
          </h1>
          <p className="text-muted-foreground mt-2">
            Track availability and performance of all marketing sites
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <PrimaryButton onClick={checkAllSites} disabled={checking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Check Now
          </PrimaryButton>
        </div>
      </div>

      {/* Overall Status Alert */}
      {sitesDown > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ {sitesDown} site{sitesDown > 1 ? 's' : ''} currently down!</strong>
            <br />
            Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overall Uptime (24h)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getUptimeColor(overallUptime)}`}>
              {overallUptime.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sites Online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sites.filter(s => s.status === 'up').length} / {sites.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sites.length > 0
                ? Math.round(sites.reduce((sum, s) => sum + s.responseTime, 0) / sites.length)
                : 0}
              <span className="text-lg text-muted-foreground ml-1">ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last Check</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {sites.length > 0
                  ? new Date(sites[0].lastChecked).toLocaleTimeString()
                  : 'Never'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sites Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Site Status</CardTitle>
          <CardDescription>Real-time status of all monitored URLs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Response Time</TableHead>
                <TableHead className="text-right">Uptime (24h)</TableHead>
                <TableHead className="text-right">Failures</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.url}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{site.name}</div>
                      <div className="text-xs text-muted-foreground">{site.url}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(site.status)}>
                      {getStatusIcon(site.status)}
                      <span className="ml-1">{site.status.toUpperCase()}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {site.status === 'up' ? `${site.responseTime}ms` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={getUptimeColor(site.uptimePercentage)}>
                      {site.uptimePercentage.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {site.failuresLast24h} / {site.checksLast24h}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(site.lastChecked).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Response Time (Last 24 Hours)
          </CardTitle>
          <CardDescription>Average response time across all sites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
                />
                <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Response Time']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Response Time"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
