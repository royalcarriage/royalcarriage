import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { DATA_FRESHNESS_THRESHOLDS, getDataFreshnessStatus } from "@/lib/kpi-thresholds";

interface DataSource {
  name: string;
  lastUpdated: Date;
  status: 'green' | 'yellow' | 'red';
  hoursAgo: number;
}

interface DataFreshnessPanelProps {
  googleAdsLastUpdate?: Date;
  ga4EventsLastUpdate?: Date;
  moovsCsvLastUpdate?: Date;
  gscDataLastUpdate?: Date;
}

function getHoursAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
}

function getDaysAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function DataFreshnessPanel({
  googleAdsLastUpdate = new Date(Date.now() - 12 * 60 * 60 * 1000), // Default: 12h ago
  ga4EventsLastUpdate = new Date(Date.now() - 18 * 60 * 60 * 1000), // Default: 18h ago
  moovsCsvLastUpdate = new Date(Date.now() - 30 * 60 * 60 * 1000), // Default: 30h ago
  gscDataLastUpdate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Default: 5d ago
}: DataFreshnessPanelProps) {
  const dataSources: DataSource[] = [
    {
      name: "Google Ads",
      lastUpdated: googleAdsLastUpdate,
      hoursAgo: getHoursAgo(googleAdsLastUpdate),
      status: getDataFreshnessStatus(
        getHoursAgo(googleAdsLastUpdate),
        DATA_FRESHNESS_THRESHOLDS.googleAds
      ),
    },
    {
      name: "GA4 Events",
      lastUpdated: ga4EventsLastUpdate,
      hoursAgo: getHoursAgo(ga4EventsLastUpdate),
      status: getDataFreshnessStatus(
        getHoursAgo(ga4EventsLastUpdate),
        DATA_FRESHNESS_THRESHOLDS.ga4Events
      ),
    },
    {
      name: "Moovs CSV",
      lastUpdated: moovsCsvLastUpdate,
      hoursAgo: getHoursAgo(moovsCsvLastUpdate),
      status: getDataFreshnessStatus(
        getHoursAgo(moovsCsvLastUpdate),
        DATA_FRESHNESS_THRESHOLDS.moovsCsv
      ),
    },
    {
      name: "GSC Data",
      lastUpdated: gscDataLastUpdate,
      hoursAgo: getDaysAgo(gscDataLastUpdate) * 24, // Convert days to hours for comparison
      status: getDataFreshnessStatus(
        getDaysAgo(gscDataLastUpdate),
        DATA_FRESHNESS_THRESHOLDS.gscData
      ),
    },
  ];

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'yellow':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'red':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'green' | 'yellow' | 'red') => {
    const variants = {
      green: "default" as const,
      yellow: "secondary" as const,
      red: "destructive" as const,
    };
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴'}
      </Badge>
    );
  };

  const formatTimeAgo = (source: DataSource) => {
    const hours = source.hoursAgo;
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Freshness</CardTitle>
        <CardDescription>
          Updated ≤24h = 🟢, 24-72h = 🟡, &gt;72h = 🔴
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dataSources.map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(source.status)}
                <div>
                  <div className="font-medium">{source.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeAgo(source)}
                  </div>
                </div>
              </div>
              {getStatusBadge(source.status)}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
          <div className="font-medium mb-1">Thresholds:</div>
          <div className="text-muted-foreground space-y-1">
            <div>Google Ads, GA4, Moovs: 🟢 ≤24h, 🟡 ≤72h, 🔴 &gt;72h</div>
            <div>GSC Data: 🟢 ≤7d, 🟡 ≤14d, 🔴 &gt;14d</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
