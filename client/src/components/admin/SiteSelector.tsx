import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, Globe } from "lucide-react";

interface Site {
  id: string;
  name: string;
  domain: string;
  status: "live" | "pending" | "building";
  icon?: string;
}

const SITES: Site[] = [
  {
    id: "airport",
    name: "Airport Service",
    domain: "chicagoairportblackcar.com",
    status: "live",
  },
  {
    id: "partybus",
    name: "Party Bus",
    domain: "chicago-partybus.com",
    status: "pending",
  },
  {
    id: "executive",
    name: "Executive Car",
    domain: "chicagoexecutivecarservice.com",
    status: "pending",
  },
  {
    id: "wedding",
    name: "Wedding Transport",
    domain: "chicagoweddingtransportation.com",
    status: "pending",
  },
];

interface SiteSelectorProps {
  selectedSite?: string;
  onSiteChange?: (siteId: string) => void;
}

export function SiteSelector({ selectedSite = "airport", onSiteChange }: SiteSelectorProps) {
  const [currentSite, setCurrentSite] = useState(selectedSite);

  const handleSiteChange = (siteId: string) => {
    setCurrentSite(siteId);
    onSiteChange?.(siteId);
  };

  const currentSiteData = SITES.find(s => s.id === currentSite);
  const statusColors = {
    live: "bg-green-500",
    pending: "bg-yellow-500",
    building: "bg-blue-500",
  };

  return (
    <div className="flex items-center gap-3">
      <Globe className="h-5 w-5 text-gray-500" />
      <Select value={currentSite} onValueChange={handleSiteChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentSiteData?.name}</span>
              <Badge 
                variant="outline" 
                className={`${statusColors[currentSiteData?.status || 'pending']} text-white border-none px-2 py-0 text-xs`}
              >
                {currentSiteData?.status}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SITES.map((site) => (
            <SelectItem key={site.id} value={site.id}>
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <div className="font-medium">{site.name}</div>
                  <div className="text-xs text-gray-500">{site.domain}</div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${statusColors[site.status]} text-white border-none px-2 py-0 text-xs`}
                >
                  {site.status}
                </Badge>
                {site.id === currentSite && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
