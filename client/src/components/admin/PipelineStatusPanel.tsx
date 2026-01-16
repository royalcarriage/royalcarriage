import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { PIPELINE_THRESHOLDS, getPagesPublishedStatus } from "@/../../shared/kpi-thresholds";

interface PipelineStatusPanelProps {
  draftsAwaitingReview?: number;
  pagesPublishedThisMonth?: number;
  pagesBlockedByGate?: number;
  queuedTopics?: number;
}

export function PipelineStatusPanel({
  draftsAwaitingReview = 12,
  pagesPublishedThisMonth = 6,
  pagesBlockedByGate = 3,
  queuedTopics = 8,
}: PipelineStatusPanelProps) {
  const getDraftsStatus = (): 'green' | 'yellow' | 'red' => {
    if (draftsAwaitingReview <= PIPELINE_THRESHOLDS.draftsAwaitingReview.green) return 'green';
    if (draftsAwaitingReview <= PIPELINE_THRESHOLDS.draftsAwaitingReview.yellow) return 'yellow';
    return 'red';
  };

  const getPublishedStatus = (): 'green' | 'yellow' | 'red' => {
    return getPagesPublishedStatus(pagesPublishedThisMonth);
  };

  const getBlockedStatus = (): 'green' | 'yellow' | 'red' => {
    if (pagesBlockedByGate <= PIPELINE_THRESHOLDS.pagesBlockedByGate.green) return 'green';
    if (pagesBlockedByGate <= PIPELINE_THRESHOLDS.pagesBlockedByGate.yellow) return 'yellow';
    return 'red';
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
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'red':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const draftsStatus = getDraftsStatus();
  const publishedStatus = getPublishedStatus();
  const blockedStatus = getBlockedStatus();

  const getPublishedMessage = () => {
    const { green, yellow } = PIPELINE_THRESHOLDS.pagesPublishedMonth;
    
    if (pagesPublishedThisMonth > yellow.max) {
      return `Too aggressive! (max ${yellow.max}/month recommended)`;
    }
    if (pagesPublishedThisMonth < yellow.min) {
      return `Too few (min ${yellow.min}/month recommended)`;
    }
    if (pagesPublishedThisMonth >= green.min && pagesPublishedThisMonth <= green.max) {
      return 'Optimal publishing rate';
    }
    return 'Within acceptable range';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Pipeline Status</CardTitle>
        <CardDescription>
          Track content production and quality gate flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Drafts Awaiting Review */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(draftsStatus)}
              <div>
                <div className="font-medium">Drafts Awaiting Review</div>
                <div className="text-sm text-muted-foreground">
                  {draftsAwaitingReview} draft{draftsAwaitingReview !== 1 ? 's' : ''} ready
                </div>
              </div>
            </div>
            {getStatusBadge(draftsStatus)}
          </div>

          {/* Pages Published This Month */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(publishedStatus)}
              <div>
                <div className="font-medium">Pages Published This Month</div>
                <div className="text-sm text-muted-foreground">
                  {pagesPublishedThisMonth} page{pagesPublishedThisMonth !== 1 ? 's' : ''} - {getPublishedMessage()}
                </div>
              </div>
            </div>
            {getStatusBadge(publishedStatus)}
          </div>

          {/* Pages Blocked by Gate */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(blockedStatus)}
              <div>
                <div className="font-medium">Pages Blocked by Gate</div>
                <div className="text-sm text-muted-foreground">
                  {pagesBlockedByGate} page{pagesBlockedByGate !== 1 ? 's' : ''} need revision
                </div>
              </div>
            </div>
            {getStatusBadge(blockedStatus)}
          </div>

          {/* Queued Topics */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Queued Topics</div>
                <div className="text-sm text-muted-foreground">
                  {queuedTopics} topic{queuedTopics !== 1 ? 's' : ''} in pipeline
                </div>
              </div>
            </div>
            <Badge variant="outline">{queuedTopics}</Badge>
          </div>
        </div>

        {/* Pipeline Flow Visualization */}
        <div className="mt-4 p-3 rounded-lg bg-muted">
          <div className="font-medium mb-2 text-sm">Pipeline Flow:</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">📝 Queued</span>
              <span className="font-mono">{queuedTopics}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">✍️ Drafting</span>
              <span className="font-mono">{draftsAwaitingReview}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">🚪 At Gate</span>
              <span className="font-mono">{pagesBlockedByGate}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground font-medium">✅ Published (MTD)</span>
              <span className="font-mono font-semibold">{pagesPublishedThisMonth}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
          <div className="font-medium mb-1">Thresholds:</div>
          <div className="text-muted-foreground space-y-1 text-xs">
            <div>Drafts: 🟢 ≤20, 🟡 ≤50, 🔴 &gt;50</div>
            <div>Published: 🟢 3-10/month, 🟡 1-15/month, 🔴 &gt;15/month</div>
            <div>Blocked: 🟢 ≤2, 🟡 ≤5, 🔴 &gt;5</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
