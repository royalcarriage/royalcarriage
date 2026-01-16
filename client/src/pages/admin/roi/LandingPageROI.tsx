import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { useSiteFilter } from '@/contexts/SiteFilterContext';

interface LandingPageROI {
  page: string;
  sessions: number;
  conversions: number;
  revenue: number;
  profitProxy: number;
  conversionRate: number;
  revenuePerSession: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Mock data joining GA4 landing pages → UTM params → Moovs bookings
const generateMockLandingPages = (): LandingPageROI[] => {
  const pages = [
    '/airport-transportation',
    '/chicago-limo-service',
    '/wedding-limousine',
    '/corporate-car-service',
    '/party-bus-rental',
    '/ohare-airport-limo',
    '/midway-airport-transportation',
    '/hourly-limo-rental',
    '/prom-limo-chicago',
    '/executive-car-service',
  ];

  return pages.map(page => {
    const sessions = Math.floor(Math.random() * 5000) + 500;
    const conversions = Math.floor(sessions * (Math.random() * 0.1 + 0.02)); // 2-12% conversion
    const revenue = conversions * (Math.random() * 500 + 200);
    const profitProxy = revenue * (Math.random() * 0.3 + 0.15); // 15-45% profit margin

    return {
      page,
      sessions,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      profitProxy: Math.round(profitProxy * 100) / 100,
      conversionRate: Math.round((conversions / sessions) * 10000) / 100,
      revenuePerSession: Math.round((revenue / sessions) * 100) / 100,
      utmSource: ['google', 'bing', 'facebook', 'direct'][Math.floor(Math.random() * 4)],
      utmMedium: ['cpc', 'organic', 'social'][Math.floor(Math.random() * 3)],
      utmCampaign: `campaign-${Math.floor(Math.random() * 10) + 1}`,
    };
  }).sort((a, b) => b.profitProxy - a.profitProxy);
};

export function LandingPageROI() {
  const { selectedSite } = useSiteFilter();
  const [landingPages] = useState<LandingPageROI[]>(generateMockLandingPages());
  const [sortField, setSortField] = useState<keyof LandingPageROI>('profitProxy');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<LandingPageROI | null>(null);

  const handleSort = (field: keyof LandingPageROI) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredPages = landingPages
    .filter(p => p.page.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * modifier;
      }
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });

  const handleRowClick = (page: LandingPageROI) => {
    setSelectedPage(page);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Landing Page ROI Analysis</CardTitle>
          <CardDescription>
            GA4 landing pages joined with UTM parameters and Moovs bookings
            {selectedSite !== 'all' && ` • Filtered by: ${selectedSite}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('page')}>
                    <div className="flex items-center gap-1">
                      Landing Page <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('sessions')}>
                    <div className="flex items-center justify-end gap-1">
                      Sessions <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('conversions')}>
                    <div className="flex items-center justify-end gap-1">
                      Conversions <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('conversionRate')}>
                    <div className="flex items-center justify-end gap-1">
                      CVR <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('revenue')}>
                    <div className="flex items-center justify-end gap-1">
                      Revenue <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('profitProxy')}>
                    <div className="flex items-center justify-end gap-1">
                      Profit Proxy <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('revenuePerSession')}>
                    <div className="flex items-center justify-end gap-1">
                      Rev/Session <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(page)}
                  >
                    <td className="p-2 flex items-center gap-2">
                      {page.page}
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </td>
                    <td className="text-right p-2">{page.sessions.toLocaleString()}</td>
                    <td className="text-right p-2">{page.conversions}</td>
                    <td className="text-right p-2">{page.conversionRate}%</td>
                    <td className="text-right p-2">${page.revenue.toLocaleString()}</td>
                    <td className="text-right p-2 font-semibold text-green-600">
                      ${page.profitProxy.toLocaleString()}
                    </td>
                    <td className="text-right p-2">${page.revenuePerSession.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPages.length} landing pages
          </div>
        </CardContent>
      </Card>

      {selectedPage && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown: {selectedPage.page}</CardTitle>
            <CardDescription>UTM parameters and traffic sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">UTM Source</div>
                <div className="text-lg font-semibold">{selectedPage.utmSource}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">UTM Medium</div>
                <div className="text-lg font-semibold">{selectedPage.utmMedium}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">UTM Campaign</div>
                <div className="text-lg font-semibold">{selectedPage.utmCampaign}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <div className="text-lg font-semibold">{selectedPage.conversionRate}%</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Performance Summary</h4>
              <div className="space-y-1 text-sm">
                <div>Total Sessions: <span className="font-semibold">{selectedPage.sessions.toLocaleString()}</span></div>
                <div>Total Conversions: <span className="font-semibold">{selectedPage.conversions}</span></div>
                <div>Total Revenue: <span className="font-semibold">${selectedPage.revenue.toLocaleString()}</span></div>
                <div>Profit Proxy: <span className="font-semibold text-green-600">${selectedPage.profitProxy.toLocaleString()}</span></div>
                <div>Revenue per Session: <span className="font-semibold">${selectedPage.revenuePerSession.toFixed(2)}</span></div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedPage(null)}
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
