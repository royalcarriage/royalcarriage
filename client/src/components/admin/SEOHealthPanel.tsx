import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSearch, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { SEO_THRESHOLDS } from "@/../../shared/kpi-thresholds";

interface SEOHealthPanelProps {
  indexedPages?: number;
  indexedPagesPrevious?: number;
  coverageErrors?: number;
  cannibalizationStatus?: 'none' | 'suspected' | 'confirmed';
  seoGateStatus?: 'PASS' | 'WARN' | 'FAIL';
  passedGates?: number;
  warningGates?: number;
  failedGates?: number;
}

export function SEOHealthPanel({
  indexedPages = 287,
  indexedPagesPrevious = 295,
  coverageErrors = 3,
  cannibalizationStatus = 'none',
  seoGateStatus = 'PASS',
  passedGates = 45,
  warningGates = 3,
  failedGates = 0,
}: SEOHealthPanelProps) {
  const indexedPagesChange = ((indexedPages - indexedPagesPrevious) / indexedPagesPrevious) * 100;
  
  const getIndexedPagesStatus = (): 'green' | 'yellow' | 'red' => {
    if (indexedPagesChange >= SEO_THRESHOLDS.indexedPages.thresholds.green) return 'green';
    if (indexedPagesChange >= SEO_THRESHOLDS.indexedPages.thresholds.yellow) return 'yellow';
    return 'red';
  };

  const getCoverageErrorsStatus = (): 'green' | 'yellow' | 'red' => {
    if (coverageErrors <= SEO_THRESHOLDS.coverageErrors.green) return 'green';
    if (coverageErrors <= SEO_THRESHOLDS.coverageErrors.yellow) return 'yellow';
    return 'red';
  };

  const getCannibalizationStatusColor = (): 'green' | 'yellow' | 'red' => {
    switch (cannibalizationStatus) {
      case 'none': return 'green';
      case 'suspected': return 'yellow';
      case 'confirmed': return 'red';
    }
  };

  const getGateStatusColor = (): 'green' | 'yellow' | 'red' => {
    switch (seoGateStatus) {
      case 'PASS': return 'green';
      case 'WARN': return 'yellow';
      case 'FAIL': return 'red';
    }
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

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'yellow':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'red':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const formatPercentChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const indexedPagesStatus = getIndexedPagesStatus();
  const coverageErrorsStatus = getCoverageErrorsStatus();
  const cannibalizationColor = getCannibalizationStatusColor();
  const gateStatusColor = getGateStatusColor();

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO System Health</CardTitle>
        <CardDescription>
          Technical SEO metrics and content quality gates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Indexed Pages */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(indexedPagesStatus)}
              <div>
                <div className="font-medium">Indexed Pages</div>
                <div className="text-sm text-muted-foreground">
                  {indexedPages} ({formatPercentChange(indexedPagesChange)} vs last month)
                </div>
              </div>
            </div>
            {getStatusBadge(indexedPagesStatus)}
          </div>

          {/* Coverage Errors */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(coverageErrorsStatus)}
              <div>
                <div className="font-medium">Coverage Errors</div>
                <div className="text-sm text-muted-foreground">
                  {coverageErrors} error{coverageErrors !== 1 ? 's' : ''} in GSC
                </div>
              </div>
            </div>
            {getStatusBadge(coverageErrorsStatus)}
          </div>

          {/* Cannibalization */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(cannibalizationColor)}
              <div>
                <div className="font-medium">Keyword Cannibalization</div>
                <div className="text-sm text-muted-foreground">
                  Status: {cannibalizationStatus === 'none' ? 'None detected' : 
                           cannibalizationStatus === 'suspected' ? 'Suspected' : 'Confirmed'}
                </div>
              </div>
            </div>
            {getStatusBadge(cannibalizationColor)}
          </div>

          {/* SEO Gate Status */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <FileSearch className={`h-5 w-5 ${
                gateStatusColor === 'green' ? 'text-green-500' : 
                gateStatusColor === 'yellow' ? 'text-yellow-500' : 
                'text-red-500'
              }`} />
              <div>
                <div className="font-medium">Quality Gate Status</div>
                <div className="text-sm text-muted-foreground">
                  {passedGates} passed, {warningGates} warnings, {failedGates} failed
                </div>
              </div>
            </div>
            {getStatusBadge(gateStatusColor)}
          </div>
        </div>

        {/* Gate Details */}
        <div className="mt-4 p-3 rounded-lg bg-muted">
          <div className="font-medium mb-2 text-sm">Recent Gate Checks:</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Content passed</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{passedGates}</span>
                <Badge variant="default" className="text-xs">🟢</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">With warnings</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{warningGates}</span>
                <Badge variant="secondary" className="text-xs">🟡</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Failed gates</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{failedGates}</span>
                <Badge variant="destructive" className="text-xs">🔴</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
          <div className="font-medium mb-1">Thresholds:</div>
          <div className="text-muted-foreground space-y-1 text-xs">
            <div>Indexed: 🟢 stable/up, 🟡 -5%, 🔴 -15%</div>
            <div>Errors: 🟢 ≤2, 🟡 ≤10, 🔴 &gt;10</div>
            <div>Gates: 🟢 PASS, 🟡 WARN, 🔴 FAIL</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
