import { Badge } from "@/components/ui/badge";
import { CircleAlert, CircleCheck, CircleX, Clock } from "lucide-react";

interface DataStatus {
  name: string;
  status: "fresh" | "stale" | "error";
  lastUpdated: string;
}

interface StatusBadgeBarProps {
  dataStatuses?: DataStatus[];
  gateStatus?: "PASS" | "WARN" | "FAIL";
  gateCount?: number;
  deployInfo?: {
    timestamp: string;
    commitHash: string;
  };
}

export function StatusBadgeBar({
  dataStatuses = [
    { name: "Ads", status: "fresh", lastUpdated: "2h ago" },
    { name: "GA4", status: "fresh", lastUpdated: "1h ago" },
    { name: "Moovs", status: "stale", lastUpdated: "5h ago" },
    { name: "GSC", status: "fresh", lastUpdated: "30m ago" },
  ],
  gateStatus = "PASS",
  gateCount = 0,
  deployInfo = {
    timestamp: "2h ago",
    commitHash: "a1b2c3d",
  },
}: StatusBadgeBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-6 text-xs">
        {/* Data Freshness */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Data Freshness:</span>
          <div className="flex items-center gap-2">
            {dataStatuses.map((data) => (
              <div key={data.name} className="flex items-center gap-1">
                <span className="font-medium">{data.name}</span>
                <Badge
                  variant={
                    data.status === "fresh"
                      ? "default"
                      : data.status === "stale"
                        ? "secondary"
                        : "destructive"
                  }
                  className="h-5 px-1.5"
                >
                  {data.status === "fresh" && (
                    <CircleCheck className="h-3 w-3" />
                  )}
                  {data.status === "stale" && <Clock className="h-3 w-3" />}
                  {data.status === "error" && <CircleX className="h-3 w-3" />}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Status */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Gate Status:</span>
          <Badge
            variant={
              gateStatus === "PASS"
                ? "default"
                : gateStatus === "WARN"
                  ? "secondary"
                  : "destructive"
            }
          >
            {gateStatus === "PASS" && <CircleCheck className="h-3 w-3 mr-1" />}
            {gateStatus === "WARN" && <CircleAlert className="h-3 w-3 mr-1" />}
            {gateStatus === "FAIL" && <CircleX className="h-3 w-3 mr-1" />}
            {gateStatus}
            {gateCount > 0 && ` (${gateCount})`}
          </Badge>
        </div>

        {/* Deploy Status */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Deploy:</span>
          <span className="text-gray-700">
            {deployInfo.timestamp} •{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
              {deployInfo.commitHash}
            </code>
          </span>
        </div>
      </div>
    </div>
  );
}
