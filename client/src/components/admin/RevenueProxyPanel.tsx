import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, DollarSign } from "lucide-react";
import { REVENUE_THRESHOLDS, getRevenueWoWStatus } from "@/lib/kpi-thresholds";

interface RevenueProxyPanelProps {
  currentRevenue?: number;
  previousRevenue?: number;
  adSpend?: number;
  driverPayout?: number;
  taxes?: number;
  avgOrderValue?: number;
  previousAvgOrderValue?: number;
}

export function RevenueProxyPanel({
  currentRevenue = 125000,
  previousRevenue = 120000,
  adSpend = 15000,
  driverPayout = 75000,
  taxes = 12500,
  avgOrderValue = 285,
  previousAvgOrderValue = 275,
}: RevenueProxyPanelProps) {
  // Calculate metrics
  const revenueWoW = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  const profitProxy = currentRevenue - adSpend - driverPayout - taxes;
  const avgOrderValueChange = ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100;
  
  // Status determination
  const revenueStatus = getRevenueWoWStatus(revenueWoW);
  
  const adSpendStatus: 'green' | 'yellow' | 'red' = 
    currentRevenue > adSpend * 2 ? 'green' :
    currentRevenue > adSpend * 1.2 ? 'yellow' : 'red';
  
  const profitStatus: 'green' | 'yellow' | 'red' = 
    profitProxy > currentRevenue * 0.1 ? 'green' :
    profitProxy > 0 ? 'yellow' : 'red';
  
  const avgOrderValueStatus: 'green' | 'yellow' | 'red' = 
    avgOrderValueChange >= 0 ? 'green' :
    avgOrderValueChange >= -5 ? 'yellow' : 'red';

  const getStatusIcon = (status: 'green' | 'yellow' | 'red', value: number) => {
    if (value > 0) {
      return <TrendingUp className={`h-5 w-5 ${status === 'green' ? 'text-green-500' : status === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`} />;
    } else if (value < 0) {
      return <TrendingDown className={`h-5 w-5 ${status === 'red' ? 'text-red-500' : 'text-yellow-500'}`} />;
    }
    return <Minus className="h-5 w-5 text-gray-500" />;
  };

  const getStatusBadge = (status: 'green' | 'yellow' | 'red') => {
    const variants = {
      green: "default" as const,
      yellow: "secondary" as const,
      red: "destructive" as const,
    };
    
    return (
      <Badge variant={variants[status]}>
        {status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴'}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & Profit Proxy</CardTitle>
        <CardDescription>
          Week-over-week performance and profitability indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Revenue WoW */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(revenueStatus, revenueWoW)}
              <div>
                <div className="font-medium">Revenue WoW</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(currentRevenue)} ({formatPercent(revenueWoW)})
                </div>
              </div>
            </div>
            {getStatusBadge(revenueStatus)}
          </div>

          {/* Ad Spend vs Revenue */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <DollarSign className={`h-5 w-5 ${adSpendStatus === 'green' ? 'text-green-500' : adSpendStatus === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`} />
              <div>
                <div className="font-medium">Ad Spend vs Revenue</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(adSpend)} / {formatCurrency(currentRevenue)} (
                  {((adSpend / currentRevenue) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
            {getStatusBadge(adSpendStatus)}
          </div>

          {/* Profit Proxy */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(profitStatus, profitProxy)}
              <div>
                <div className="font-medium">Profit Proxy</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(profitProxy)} ({((profitProxy / currentRevenue) * 100).toFixed(1)}% margin)
                </div>
              </div>
            </div>
            {getStatusBadge(profitStatus)}
          </div>

          {/* Average Order Value */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(avgOrderValueStatus, avgOrderValueChange)}
              <div>
                <div className="font-medium">Avg Order Value</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(avgOrderValue)} ({formatPercent(avgOrderValueChange)})
                </div>
              </div>
            </div>
            {getStatusBadge(avgOrderValueStatus)}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
          <div className="font-medium mb-2">Profit Proxy Calculation:</div>
          <div className="text-muted-foreground space-y-1 font-mono text-xs">
            <div>Revenue: {formatCurrency(currentRevenue)}</div>
            <div>- Ad Spend: {formatCurrency(adSpend)}</div>
            <div>- Driver Payout: {formatCurrency(driverPayout)}</div>
            <div>- Taxes: {formatCurrency(taxes)}</div>
            <div className="border-t border-border pt-1 mt-1 font-semibold">
              = Profit Proxy: {formatCurrency(profitProxy)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
