import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PublishingFrozenBannerProps {
  isVisible?: boolean;
  staleDataSources?: string[];
}

export function PublishingFrozenBanner({
  isVisible = false,
  staleDataSources = [],
}: PublishingFrozenBannerProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 border-2 border-red-500">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">⚠️ PUBLISHING FROZEN</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="font-medium">
            Content publishing has been automatically frozen due to stale data sources.
          </p>
          {staleDataSources.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-sm mb-1">Stale data sources (&gt;72h or &gt;14d):</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {staleDataSources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-sm">
            <strong>Action required:</strong> Update all data sources to resume publishing. Publishing will automatically unfreeze when all data sources are fresh.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
