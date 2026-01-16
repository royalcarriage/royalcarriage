import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, TrendingUp, Filter, Calendar } from 'lucide-react';

interface ErrorLog {
  id: string;
  page: string;
  errorMessage: string;
  errorType: string;
  timestamp: string;
  count: number;
  stackTrace?: string;
}

// Mock data - replace with actual API call
const MOCK_ERRORS: ErrorLog[] = [
  {
    id: '1',
    page: '/booking',
    errorMessage: 'Cannot read property "price" of undefined',
    errorType: 'TypeError',
    timestamp: '2024-01-17T14:30:00Z',
    count: 12,
  },
  {
    id: '2',
    page: '/fleet/executive-sedan',
    errorMessage: 'Network request failed',
    errorType: 'NetworkError',
    timestamp: '2024-01-17T13:15:00Z',
    count: 5,
  },
  {
    id: '3',
    page: '/contact',
    errorMessage: 'Form validation error: invalid email',
    errorType: 'ValidationError',
    timestamp: '2024-01-17T12:00:00Z',
    count: 8,
  },
];

const ERROR_TYPES = ['All', 'TypeError', 'NetworkError', 'ValidationError', 'ReferenceError'];

export default function ErrorMonitoring() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedErrorType, setSelectedErrorType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock chart data - replace with actual data
  const chartData = [
    { date: '2024-01-11', errors: 15 },
    { date: '2024-01-12', errors: 12 },
    { date: '2024-01-13', errors: 18 },
    { date: '2024-01-14', errors: 8 },
    { date: '2024-01-15', errors: 22 },
    { date: '2024-01-16', errors: 14 },
    { date: '2024-01-17', errors: 25 },
  ];

  const filteredErrors = useMemo(() => {
    return MOCK_ERRORS.filter((error) => {
      const matchesType = selectedErrorType === 'All' || error.errorType === selectedErrorType;
      const matchesSearch = error.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           error.errorMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [selectedErrorType, searchQuery]);

  const groupedByPage = useMemo(() => {
    const grouped = filteredErrors.reduce((acc, error) => {
      if (!acc[error.page]) {
        acc[error.page] = [];
      }
      acc[error.page].push(error);
      return acc;
    }, {} as Record<string, ErrorLog[]>);
    return grouped;
  }, [filteredErrors]);

  const totalErrors = useMemo(() => {
    return filteredErrors.reduce((sum, error) => sum + error.count, 0);
  }, [filteredErrors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          Error Monitoring
        </h1>
        <p className="text-muted-foreground mt-2">
          Track and analyze JavaScript errors across all pages
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Errors</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredErrors.length}</div>
            <p className="text-xs text-muted-foreground">
              Distinct error types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Pages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(groupedByPage).length}</div>
            <p className="text-xs text-muted-foreground">
              Pages with errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Error Trend (Last 7 Days)</CardTitle>
          <CardDescription>
            Track error frequency over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((data) => (
              <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-red-500 rounded-t"
                  style={{ height: `${(data.errors / 25) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground transform -rotate-45">
                  {data.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="errorType">Error Type</Label>
              <Select value={selectedErrorType} onValueChange={setSelectedErrorType}>
                <SelectTrigger id="errorType">
                  <SelectValue placeholder="Select error type" />
                </SelectTrigger>
                <SelectContent>
                  {ERROR_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by page or error message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Errors by Page */}
      <Card>
        <CardHeader>
          <CardTitle>Errors by Page</CardTitle>
          <CardDescription>
            Grouped by page location
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByPage).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No errors found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Error Type</TableHead>
                  <TableHead>Error Message</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredErrors.map((error) => (
                  <TableRow key={error.id}>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {error.page}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{error.errorType}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {error.errorMessage}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{error.count}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(error.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
