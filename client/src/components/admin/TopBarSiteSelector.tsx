import { useSiteFilter, SITES } from '@/contexts/SiteFilterContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TopBarSiteSelector() {
  const { selectedSite, setSelectedSite } = useSiteFilter();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="site-selector" className="text-sm font-medium text-gray-700">
        Site:
      </label>
      <Select value={selectedSite} onValueChange={setSelectedSite}>
        <SelectTrigger id="site-selector" className="w-[280px]">
          <SelectValue placeholder="Select a site" />
        </SelectTrigger>
        <SelectContent>
          {SITES.map((site) => (
            <SelectItem key={site.value} value={site.value}>
              {site.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
