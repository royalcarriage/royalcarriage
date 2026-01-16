import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowUpDown } from 'lucide-react';
import type { KeywordAction } from '@shared/admin-types';

const ACTION_COLORS = {
  SCALE: 'bg-green-500',
  FIX: 'bg-yellow-500',
  PAUSE: 'bg-red-500',
  ADD_NEGATIVES: 'bg-orange-500',
  BUILD_PAGE: 'bg-blue-500',
};

// Mock data for top 100 keywords
const generateMockKeywords = (): KeywordAction[] => {
  const actions: KeywordAction['action'][] = ['SCALE', 'FIX', 'PAUSE', 'ADD_NEGATIVES', 'BUILD_PAGE'];
  const keywords = [
    'limo service chicago', 'airport transportation', 'wedding limo', 'corporate car service',
    'party bus rental', 'prom limo', 'chicago o\'hare limo', 'bachelor party bus',
    'luxury car service', 'hourly limo rental', 'stretch limo chicago', 'black car service',
    'executive transportation', 'midway airport limo', 'wine tour transportation'
  ];
  
  return Array.from({ length: 100 }, (_, i) => {
    const spend = Math.random() * 5000 + 100;
    const conversions = Math.floor(Math.random() * 50);
    const revenue = conversions * (Math.random() * 500 + 200);
    const roas = revenue / spend;
    const cpa = conversions > 0 ? spend / conversions : 0;
    
    return {
      keyword: keywords[i % keywords.length] + (i > 14 ? ` variant ${i}` : ''),
      spend: Math.round(spend * 100) / 100,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      recommendedPage: `/services/${keywords[i % keywords.length].toLowerCase().replace(/\s+/g, '-')}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      reason: 'Based on performance metrics and landing page analysis',
    };
  });
};

export function KeywordScaleFix() {
  const [keywords] = useState<KeywordAction[]>(generateMockKeywords());
  const [sortField, setSortField] = useState<keyof KeywordAction>('spend');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: keyof KeywordAction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredKeywords = keywords
    .filter(k => filterAction === 'all' || k.action === filterAction)
    .filter(k => k.keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * modifier;
      }
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });

  const exportToCSV = () => {
    const escapeCSV = (value: any): string => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Keyword', 'Spend', 'Conversions', 'Revenue', 'ROAS', 'CPA', 'Recommended Page', 'Action', 'Reason'];
    const rows = filteredKeywords.map(k => [
      k.keyword, k.spend, k.conversions, k.revenue, k.roas, k.cpa, k.recommendedPage, k.action, k.reason
    ]);
    const csv = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword-scale-fix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Scale/Fix Analysis</CardTitle>
          <CardDescription>
            Top 100 keywords with recommended actions based on performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Actions</option>
              <option value="SCALE">Scale</option>
              <option value="FIX">Fix</option>
              <option value="PAUSE">Pause</option>
              <option value="ADD_NEGATIVES">Add Negatives</option>
              <option value="BUILD_PAGE">Build Page</option>
            </select>
            <Button onClick={exportToCSV} variant="outline" className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('keyword')}>
                    <div className="flex items-center gap-1">
                      Keyword <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('spend')}>
                    <div className="flex items-center justify-end gap-1">
                      Spend <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('conversions')}>
                    <div className="flex items-center justify-end gap-1">
                      Conversions <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('revenue')}>
                    <div className="flex items-center justify-end gap-1">
                      Revenue <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('roas')}>
                    <div className="flex items-center justify-end gap-1">
                      ROAS <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('cpa')}>
                    <div className="flex items-center justify-end gap-1">
                      CPA <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left p-2">Recommended Page</th>
                  <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('action')}>
                    <div className="flex items-center gap-1">
                      Action <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.map((kw, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{kw.keyword}</td>
                    <td className="text-right p-2">${kw.spend.toFixed(2)}</td>
                    <td className="text-right p-2">{kw.conversions}</td>
                    <td className="text-right p-2">${kw.revenue.toFixed(2)}</td>
                    <td className="text-right p-2">{kw.roas.toFixed(2)}x</td>
                    <td className="text-right p-2">${kw.cpa.toFixed(2)}</td>
                    <td className="p-2 text-sm text-gray-600">{kw.recommendedPage}</td>
                    <td className="p-2">
                      <Badge className={ACTION_COLORS[kw.action]}>
                        {kw.action.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredKeywords.length} of {keywords.length} keywords
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
