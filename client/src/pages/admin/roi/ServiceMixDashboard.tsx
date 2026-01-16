import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useSiteFilter } from '@/contexts/SiteFilterContext';
import { analyzeProfitByServiceType } from '@shared/profit-proxy';
import type { Booking } from '@shared/admin-types';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export function ServiceMixDashboard() {
  const { selectedSite } = useSiteFilter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // TODO: Fetch bookings from Firestore
    // Filter by selectedSite if not 'all'
    // For now, using mock data
    const mockBookings: Booking[] = [
      {
        id: '1',
        orderNo: 'ORD001',
        tripNo: 'TRIP001',
        totalAmount: 150,
        baseRate: 120,
        taxAmount: 15,
        driverPayout: 48,
        pickupDate: '2024-01-15',
        serviceType: 'airport',
        vehicleType: 'sedan',
      },
      {
        id: '2',
        orderNo: 'ORD002',
        tripNo: 'TRIP002',
        totalAmount: 300,
        baseRate: 250,
        taxAmount: 30,
        driverPayout: 100,
        pickupDate: '2024-01-16',
        serviceType: 'corporate',
        vehicleType: 'suv',
      },
      {
        id: '3',
        orderNo: 'ORD003',
        tripNo: 'TRIP003',
        totalAmount: 500,
        baseRate: 420,
        taxAmount: 50,
        driverPayout: 168,
        pickupDate: '2024-01-17',
        serviceType: 'wedding',
        vehicleType: 'limo',
      },
    ];

    setBookings(mockBookings);
    setLoading(false);
  }, [selectedSite]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const analysis = analyzeProfitByServiceType(bookings);

  // Prepare chart data
  const revenueByServiceData = analysis.map((item, index) => ({
    name: item.serviceType,
    revenue: item.totalRevenue,
    profit: item.totalProfit,
    fill: COLORS[index % COLORS.length],
  }));

  const profitMarginData = analysis.map((item, index) => ({
    name: item.serviceType,
    margin: item.profitMargin,
    fill: COLORS[index % COLORS.length],
  }));

  // Mock trend data (would come from time-series data)
  const trendData = [
    { month: 'Jan', airport: 45000, corporate: 32000, wedding: 18000 },
    { month: 'Feb', airport: 52000, corporate: 35000, wedding: 22000 },
    { month: 'Mar', airport: 48000, corporate: 38000, wedding: 25000 },
    { month: 'Apr', airport: 61000, corporate: 42000, wedding: 30000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Mix Analysis</h1>
        <p className="text-gray-600 mt-1">
          Revenue and profit breakdown by service type
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">
              {analysis.reduce((sum, a) => sum + a.bookingCount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">
              ${analysis.reduce((sum, a) => sum + a.totalRevenue, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Profit</CardDescription>
            <CardTitle className="text-3xl">
              ${analysis.reduce((sum, a) => sum + a.totalProfit, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Profit Margin</CardDescription>
            <CardTitle className="text-3xl">
              {(
                analysis.reduce((sum, a) => sum + a.profitMargin, 0) /
                analysis.length
              ).toFixed(1)}
              %
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Service Type - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
            <CardDescription>Distribution of total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByServiceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueByServiceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margin by Service Type - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margin by Service Type</CardTitle>
            <CardDescription>Percentage of revenue retained as profit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitMarginData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="margin" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Over Time - Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend by Service Type</CardTitle>
          <CardDescription>Monthly revenue trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="airport" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="corporate" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="wedding" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Type Details</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-4">Service Type</th>
                <th className="py-2 px-4 text-right">Bookings</th>
                <th className="py-2 px-4 text-right">Revenue</th>
                <th className="py-2 px-4 text-right">Profit</th>
                <th className="py-2 px-4 text-right">Avg Profit</th>
                <th className="py-2 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map((row) => (
                <tr key={row.serviceType} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 font-medium capitalize">{row.serviceType}</td>
                  <td className="py-2 px-4 text-right">{row.bookingCount}</td>
                  <td className="py-2 px-4 text-right">
                    ${row.totalRevenue.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${row.totalProfit.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${row.avgProfit.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">{row.profitMargin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
