import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp } from 'lucide-react';
import { identifyUpgradeOpportunities } from '@shared/profit-proxy';
import type { Booking } from '@shared/admin-types';

interface UpgradeOpportunity {
  bookingId: string;
  orderNo: string;
  currentService: string;
  vehicleType: string;
  currentRevenue: number;
  suggestion: string;
  estimatedIncrease: number;
  potentialRevenue: number;
  opportunityType: 'service_upgrade' | 'vehicle_upgrade' | 'duration_extension';
}

// Mock data with upgrade opportunities
const generateMockOpportunities = (): UpgradeOpportunity[] => {
  const mockBookings: Booking[] = Array.from({ length: 50 }, (_, i) => ({
    id: `booking-${i}`,
    orderNo: `ORD${String(i + 1).padStart(4, '0')}`,
    tripNo: `TRIP${String(i + 1).padStart(4, '0')}`,
    totalAmount: Math.random() < 0.6 ? Math.random() * 100 + 80 : Math.random() * 300 + 200,
    baseRate: 100,
    taxAmount: 10,
    driverPayout: 40,
    pickupDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    serviceType: Math.random() < 0.5 ? 'airport' : 'corporate',
    vehicleType: ['sedan', 'suv', 'luxury sedan'][Math.floor(Math.random() * 3)],
  }));

  return mockBookings
    .map(booking => {
      const opportunity = identifyUpgradeOpportunities(booking);
      if (!opportunity.hasOpportunity) return null;

      let opportunityType: UpgradeOpportunity['opportunityType'] = 'service_upgrade';
      if (opportunity.suggestion.includes('Sprinter')) {
        opportunityType = 'vehicle_upgrade';
      } else if (opportunity.suggestion.includes('hourly')) {
        opportunityType = 'duration_extension';
      }

      return {
        bookingId: booking.id,
        orderNo: booking.orderNo,
        currentService: booking.serviceType,
        vehicleType: booking.vehicleType,
        currentRevenue: booking.totalAmount,
        suggestion: opportunity.suggestion,
        estimatedIncrease: opportunity.estimatedIncrease,
        potentialRevenue: booking.totalAmount + opportunity.estimatedIncrease,
        opportunityType,
      };
    })
    .filter((o): o is UpgradeOpportunity => o !== null)
    .sort((a, b) => b.estimatedIncrease - a.estimatedIncrease);
};

const OPPORTUNITY_TYPE_COLORS = {
  service_upgrade: 'bg-blue-500',
  vehicle_upgrade: 'bg-purple-500',
  duration_extension: 'bg-green-500',
};

export function AOVBoosterReport() {
  const [opportunities] = useState<UpgradeOpportunity[]>(generateMockOpportunities());
  const [filterType, setFilterType] = useState<string>('all');

  const filteredOpportunities = opportunities.filter(
    o => filterType === 'all' || o.opportunityType === filterType
  );

  const totalPotentialIncrease = filteredOpportunities.reduce(
    (sum, o) => sum + o.estimatedIncrease,
    0
  );

  const exportToCSV = () => {
    const escapeCSV = (value: any): string => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Booking ID',
      'Order No',
      'Current Service',
      'Vehicle Type',
      'Current Revenue',
      'Suggestion',
      'Estimated Increase',
      'Potential Revenue',
      'Opportunity Type',
    ];
    const rows = filteredOpportunities.map(o => [
      o.bookingId,
      o.orderNo,
      o.currentService,
      o.vehicleType,
      o.currentRevenue.toFixed(2),
      o.suggestion,
      o.estimatedIncrease.toFixed(2),
      o.potentialRevenue.toFixed(2),
      o.opportunityType,
    ]);
    const csv = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aov-booster-opportunities.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AOV Booster Report</CardTitle>
              <CardDescription>
                Identify upgrade opportunities to increase average order value
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
              <TrendingUp className="w-6 h-6" />
              +${totalPotentialIncrease.toLocaleString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Opportunity Types</option>
              <option value="service_upgrade">Service Upgrade</option>
              <option value="vehicle_upgrade">Vehicle Upgrade</option>
              <option value="duration_extension">Duration Extension</option>
            </select>
            <Button onClick={exportToCSV} variant="outline" className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Opportunities
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Total Opportunities</div>
                <div className="text-3xl font-bold">{filteredOpportunities.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Avg Increase per Opportunity</div>
                <div className="text-3xl font-bold">
                  ${(totalPotentialIncrease / filteredOpportunities.length || 0).toFixed(0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Total Potential Increase</div>
                <div className="text-3xl font-bold text-green-600">
                  ${totalPotentialIncrease.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Order No</th>
                  <th className="text-left p-2">Current Service</th>
                  <th className="text-left p-2">Vehicle Type</th>
                  <th className="text-right p-2">Current Revenue</th>
                  <th className="text-left p-2">Suggestion</th>
                  <th className="text-right p-2">Est. Increase</th>
                  <th className="text-right p-2">Potential Revenue</th>
                  <th className="text-left p-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpportunities.map((opp, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{opp.orderNo}</td>
                    <td className="p-2 capitalize">{opp.currentService}</td>
                    <td className="p-2 capitalize">{opp.vehicleType}</td>
                    <td className="text-right p-2">${opp.currentRevenue.toFixed(2)}</td>
                    <td className="p-2 text-sm">{opp.suggestion}</td>
                    <td className="text-right p-2 font-semibold text-green-600">
                      +${opp.estimatedIncrease.toFixed(2)}
                    </td>
                    <td className="text-right p-2 font-semibold">
                      ${opp.potentialRevenue.toFixed(2)}
                    </td>
                    <td className="p-2">
                      <Badge className={OPPORTUNITY_TYPE_COLORS[opp.opportunityType]}>
                        {opp.opportunityType.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredOpportunities.length} opportunities with total potential increase of $
            {totalPotentialIncrease.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Breakdown</CardTitle>
          <CardDescription>Distribution by opportunity type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(['service_upgrade', 'vehicle_upgrade', 'duration_extension'] as const).map(type => {
              const count = opportunities.filter(o => o.opportunityType === type).length;
              const increase = opportunities
                .filter(o => o.opportunityType === type)
                .reduce((sum, o) => sum + o.estimatedIncrease, 0);
              
              return (
                <div key={type} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className={OPPORTUNITY_TYPE_COLORS[type]}>
                      {type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-600">{count} opportunities</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    +${increase.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
