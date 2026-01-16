import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataFreshnessChip } from "./chips/DataFreshnessChip";
import { GateStatusChip } from "./chips/GateStatusChip";
import { DeployStatusChip } from "./chips/DeployStatusChip";
import { TrackingStatusChip } from "./chips/TrackingStatusChip";
import { ImageHealthChip } from "./chips/ImageHealthChip";

interface TopBarProps {
  currentSite?: string;
  onSiteChange?: (site: string) => void;
}

export function TopBar({ currentSite = "airport", onSiteChange }: TopBarProps) {
  return (
    <div className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <Select value={currentSite} onValueChange={onSiteChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="airport">Airport</SelectItem>
              <SelectItem value="partybus">Party Bus</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="wedding">Wedding</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-3">
          <DataFreshnessChip hoursOld={12} />
          <GateStatusChip status="pass" />
          <DeployStatusChip status="deployed" />
          <TrackingStatusChip status="active" />
          <ImageHealthChip missingCount={3} totalCount={150} />
        </div>
      </div>
    </div>
  );
}
