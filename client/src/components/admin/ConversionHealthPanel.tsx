import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MousePointer, ScrollText, Activity } from "lucide-react";
import { CONVERSION_THRESHOLDS, getConversionStatus, getScroll75Status, getBounceRateStatus } from "@/../../shared/kpi-thresholds";

interface PageMetrics {
  pagePath: string;
  pageTitle: string;
  clickToCall: number;
  clickToCallBaseline: number;
  bookNowClicks: number;
  bookNowClicksBaseline: number;
  scroll75Pct: number;
  bounceRate: number;
  bounceRateBaseline: number;
}

interface ConversionHealthPanelProps {
  pages?: PageMetrics[];
}

const defaultPages: PageMetrics[] = [
  {
    pagePath: "/ohare-airport-limo",
    pageTitle: "O'Hare Airport",
    clickToCall: 145,
    clickToCallBaseline: 150,
    bookNowClicks: 89,
    bookNowClicksBaseline: 85,
    scroll75Pct: 45,
    bounceRate: 32,
    bounceRateBaseline: 30,
  },
  {
    pagePath: "/naperville-limo",
    pageTitle: "Naperville Service",
    clickToCall: 67,
    clickToCallBaseline: 75,
    bookNowClicks: 42,
    bookNowClicksBaseline: 45,
    scroll75Pct: 38,
    bounceRate: 35,
    bounceRateBaseline: 28,
  },
  {
    pagePath: "/corporate-transportation",
    pageTitle: "Corporate Service",
    clickToCall: 92,
    clickToCallBaseline: 88,
    bookNowClicks: 61,
    bookNowClicksBaseline: 60,
    scroll75Pct: 52,
    bounceRate: 25,
    bounceRateBaseline: 26,
  },
];

export function ConversionHealthPanel({ pages = defaultPages }: ConversionHealthPanelProps) {
  const getStatusBadge = (status: 'green' | 'yellow' | 'red') => {
    const variants = {
      green: "default" as const,
      yellow: "secondary" as const,
      red: "destructive" as const,
    };
    
    return (
      <Badge variant={variants[status]} className="text-xs">
        {status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴'}
      </Badge>
    );
  };

  const formatPercentChange = (current: number, baseline: number) => {
    const change = ((current - baseline) / baseline) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getOverallStatus = (page: PageMetrics): 'green' | 'yellow' | 'red' => {
    const clickToCallStatus = getConversionStatus(page.clickToCall, page.clickToCallBaseline, 'clickToCall');
    const bookNowStatus = getConversionStatus(page.bookNowClicks, page.bookNowClicksBaseline, 'bookNowClicks');
    const scrollStatus = getScroll75Status(page.scroll75Pct);
    const bounceStatus = getBounceRateStatus(page.bounceRate, page.bounceRateBaseline);
    
    // If any metric is red, overall is red
    if ([clickToCallStatus, bookNowStatus, scrollStatus, bounceStatus].includes('red')) {
      return 'red';
    }
    // If any metric is yellow, overall is yellow
    if ([clickToCallStatus, bookNowStatus, scrollStatus, bounceStatus].includes('yellow')) {
      return 'yellow';
    }
    return 'green';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Health (Per Page)</CardTitle>
        <CardDescription>
          Tracking key conversion metrics vs baseline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page) => {
            const overallStatus = getOverallStatus(page);
            const clickToCallStatus = getConversionStatus(page.clickToCall, page.clickToCallBaseline, 'clickToCall');
            const bookNowStatus = getConversionStatus(page.bookNowClicks, page.bookNowClicksBaseline, 'bookNowClicks');
            const scrollStatus = getScroll75Status(page.scroll75Pct);
            const bounceStatus = getBounceRateStatus(page.bounceRate, page.bounceRateBaseline);

            return (
              <div key={page.pagePath} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{page.pageTitle}</div>
                    <div className="text-xs text-muted-foreground">{page.pagePath}</div>
                  </div>
                  {getStatusBadge(overallStatus)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Click to Call */}
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-medium">Click to Call</div>
                        <div className="text-xs text-muted-foreground">
                          {page.clickToCall} ({formatPercentChange(page.clickToCall, page.clickToCallBaseline)})
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(clickToCallStatus)}
                  </div>

                  {/* Book Now */}
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-medium">Book Now</div>
                        <div className="text-xs text-muted-foreground">
                          {page.bookNowClicks} ({formatPercentChange(page.bookNowClicks, page.bookNowClicksBaseline)})
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(bookNowStatus)}
                  </div>

                  {/* Scroll 75% */}
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <ScrollText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-medium">Scroll 75%</div>
                        <div className="text-xs text-muted-foreground">
                          {page.scroll75Pct}% of visitors
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(scrollStatus)}
                  </div>

                  {/* Bounce Rate */}
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-medium">Bounce Rate</div>
                        <div className="text-xs text-muted-foreground">
                          {page.bounceRate}% ({formatPercentChange(page.bounceRate, page.bounceRateBaseline)})
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(bounceStatus)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
          <div className="font-medium mb-1">Thresholds:</div>
          <div className="text-muted-foreground space-y-1 text-xs">
            <div>Click/Book: 🟢 ≥0%, 🟡 ≥-5%, 🔴 &lt;-10%</div>
            <div>Scroll 75%: 🟢 ≥40%, 🟡 ≥25%, 🔴 &lt;25%</div>
            <div>Bounce: 🟢 ≤+0%, 🟡 ≤+5%, 🔴 &gt;+10%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
